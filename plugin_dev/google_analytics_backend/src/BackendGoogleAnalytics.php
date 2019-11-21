<?php
/**
 * BackendGoogleAnalytics plugin for Craft CMS 3.x
 *
 * Allows submitting analytical data to GA without relying on the (blockable) frontend JS code
 *
 * @link      moliski.net
 * @copyright Copyright (c) 2019 Adam Moliski
 */

namespace moliski\backendgoogleanalytics;

use moliski\backendgoogleanalytics\models\Settings;

use Craft;
use craft\base\Plugin;
use craft\services\Plugins;
use craft\events\PluginEvent;

use yii\base\Event;
use yii\web\Cookie;



abstract class AbstractAnalytics {

    protected $debug = false;

    public function __construct($debug) {
          $this->debug = $debug;
    }

    /*
    Sends a normal page-view type tracking request to the analytics server
    */
    public function Track($title) {
        if (!method_exists($this, "GetHitRequest")) {
            throw new Exception( "Missing GetHitRequest function");
        }
        $response = $this->_URLPost(
                    $this->getHost(),
                    $this->GetHitRequest($this->getUrlPath(),
                                         $title));
        if( $this->debug )
            log($response);
            //log($response);
        return $response;
    }

    /*
    Sends a exception type tracking request to the analytics server
    */
    public function Error($title, $errorcode) {
        if (!method_exists($this, "GetErrorRequest")) {
            throw new Exception( "Missing GetErrorRequest function");
        }

        $response = $this->_URLPost(
                    $this->getHost(),
                    $this->GetErrorRequest($this->getUrlPath(),
                                           $title,
                                           $errorcode));
        if( $this->debug )
            echo $response;
        return $response;
    }

    /*
    Gets the analytics host name (e.g. https://www.google-analytics.com)
    */
    abstract protected function getHost();

    /*
    Gets the full url to the requested resource
    */
    protected function getUrlPath() {
        return 'http' . (isset($_SERVER['HTTPS']) ? 's' : '') .
           '://' .
           "{$_SERVER['HTTP_HOST']}{$_SERVER['REQUEST_URI']}";
    }

    /*
    Gets the user agent attached to the original request
    */
    protected function _getUserAgent() {
        return array_key_exists('HTTP_USER_AGENT', $_SERVER)
            ? $_SERVER['HTTP_USER_AGENT'] : "";
    }

    /*
    Gets the http referer for the original request
    */
    protected function _getReferer() {
        return array_key_exists('HTTP_REFERER', $_SERVER)
          ? $_SERVER['HTTP_REFERER'] : "";
    }

    /*
    Gets the remote ip address for the original request
    */
    protected function _getRemoteIP() {
        return array_key_exists('REMOTE_ADDR', $_SERVER)
          ? $_SERVER['REMOTE_ADDR'] : "";
    }

    /*
    Performs a POST request of the data in $data_array to the URL in $url
    */
    private function _URLPost($url, $data_array) {
      // Need to encode spaces, otherwise services such
      // as Google will return 400 bad request!
      $url = str_replace(" ", "%20", $url);

      // Construct the contexts for the POST requests
      $opts = array(
        'https'=>array(
        'method'=>"POST",
        'header'=>
          "Accept: application/json, text/javascript, */*; q=0.01\r\n".
          "Content-type: application/x-www-form-urlencoded; charset=UTF-8\r\n".
          "User-Agent: Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.155 Safari/537.36\r\n".
          "Referer: https://api.example.com/\r\n",
        'content' => http_build_query($data_array)
        )
        ,
        'http'=>array(
        'method'=>"POST",
        'header'=>
          "Accept: application/json, text/javascript, */*; q=0.01\r\n".
          "Content-type: application/x-www-form-urlencoded; charset=UTF-8\r\n".
          "User-Agent: Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.155 Safari/537.36\r\n".
          "Referer: https://api.example.com/\r\n",
        'content' => http_build_query($data_array)
        )
      );

      $context = stream_context_create($opts);
      $result = null;
      $dh = fopen("$url",'rb', false, $context);
      if( !$dh )
        return null;

      if( $dh !== false )
        $result = stream_get_contents($dh);

      fclose($dh);

      return $result;
  }
}



class GoogleAnalytics extends AbstractAnalytics {

    protected $google_host = 'https://www.google-analytics.com/collect';
    protected $google_debug_host = 'https://www.google-analytics.com/debug/collect';

    /*
    The Google Analytics Tracking Id for this property (e.g. UA-XXXXXX-XX)
    */
    protected $trackingId = '';

    /*
    The name of the application, this is sent to the Google servers
    */
    protected $appName = '';

    public function __construct($TrackingID, $ApplicationName, $debug) {
        parent::__construct($debug);

        $this->trackingId = $TrackingID;
        $this->appName = $ApplicationName;
    }

    protected function getHost() {
      if( $this->debug )
          return $this->google_debug_host;
      return $this->google_host;
    }

    private function getCommonDataArray($url, $title){
        // Standard params
        $v   = 1;
        $cid = $this->_ParseOrCreateAnalyticsCookie();

        return array(
            'v'   => $v,
            'tid' => $this->trackingId,
            'cid' => $cid,
            'an'  => $this->appName,
            'dt'  => $title,
            'dl'  => $url,
            'ua'  => $this->_getUserAgent(),
            'dr'  => $this->_getReferer(),
            'uip' => $this->_getRemoteIP(),
            'av'  => '1.0'
        );
    }

    protected function GetHitRequest($url, $title) {
        // Create the pageview data
        $data = $this->getCommonDataArray($url, $title);
        $data['t'] = 'pageview';

        // Send PageView hit as POST
        return $data;
    }

    protected function GetErrorRequest($url, $title, $errorcode){
        // Create the error data
        $data = $this->getCommonDataArray($url, $title);
        $data['t']   = 'exception';
        $data['exd'] = $errorcode;
        $data['exf'] = '1';

        return $data;
    }

  // Gets the current Analytics session identifier or
  // creates a new one if it does not exist
    private function _ParseOrCreateAnalyticsCookie() {
      $cid = "";
      if (isset(Craft::$app->request->cookies['_gan'])) {
        $cookie = Craft::$app->request->cookies['_gan']->value;
        list($version, $domainDepth, $cid1, $cid2) = preg_split('[\.]', $cookie, 4);
        $contents = array(
          'version' => $version,
          'domainDepth' => $domainDepth,
          'cid' => $cid1 . '.' . $cid2
        );
        $cid = $contents['cid'];
      } else {
        //log('cookie is not set');
        // no analytics cookie is found. Create a new one
        $cid1 = mt_rand(0, 2147483647);
        $cid2 = mt_rand(0, 2147483647);
        $cid = $cid1 . '.' . $cid2;
        $cookies = Craft::$app->response->cookies;
        $cookies->add(new Cookie([
          'name' => '_gan',
          'value' => 'GA1.2.' . $cid,
          'expire' => time() + 60 * 60 * 24 * 365 * 2,
        ]));
      }
      //log('CID: '.$cid);
      return $cid;
    }
}

function log($message){
        Craft::warning($message, "TEST");
      }
function dbg_var_dump($var){
    ob_start();
    var_dump($var);
    $result = ob_get_clean();
    $res =  strip_tags(strtr($result, ['=&gt;' => '=>']));
    foreach(preg_split("/((\r?\n)|(\r\n?))/", $res) as $line){
        log($line);
    }
}

/**
 * Craft plugins are very much like little applications in and of themselves. We’ve made
 * it as simple as we can, but the training wheels are off. A little prior knowledge is
 * going to be required to write a plugin.
 *
 * For the purposes of the plugin docs, we’re going to assume that you know PHP and SQL,
 * as well as some semi-advanced concepts like object-oriented programming and PHP namespaces.
 *
 * https://craftcms.com/docs/plugins/introduction
 *
 * @author    Adam Moliski
 * @package   BackendGoogleAnalytics
 * @since     0.0.1
 *
 * @property  Settings $settings
 * @method    Settings getSettings()
 */

class BackendGoogleAnalytics extends Plugin
{
    // Static Properties
    // =========================================================================
    public static $plugin;
    public $schemaVersion = '0.0.1';

    // Public Methods
    // =========================================================================


    private function runAnalytics(){
      //$cookie = $this -> getOrSetCookie();
      $analytics = new GoogleAnalytics($this->getSettings()->tracking_id, "auto", false);
      $analytics->Track("Backend hit");
      //$dbg_var_dump(Craft:$app->requests);
    }


    public function init()
    {
        parent::init();
        self::$plugin = $this;

        if(!Craft::$app->request -> isCpRequest){
          $this->runAnalytics();
        }

        //}
        // Do something after we're installed
        Event::on(
            Plugins::class,
            Plugins::EVENT_AFTER_INSTALL_PLUGIN,
            function (PluginEvent $event) {
                if ($event->plugin === $this) {
                    // We were just installed
                }
            }
        );

/**
 * Logging in Craft involves using one of the following methods:
 *
 * Craft::trace(): record a message to trace how a piece of code runs. This is mainly for development use.
 * Craft::info(): record a message that conveys some useful information.
 * Craft::warning(): record a warning message that indicates something unexpected has happened.
 * Craft::error(): record a fatal error that should be investigated as soon as possible.
 *
 * Unless `devMode` is on, only Craft::warning() & Craft::error() will log to `craft/storage/logs/web.log`
 *
 * It's recommended that you pass in the magic constant `__METHOD__` as the second parameter, which sets
 * the category to the method (prefixed with the fully qualified class name) where the constant appears.
 *
 * To enable the Yii debug toolbar, go to your user account in the AdminCP and check the
 * [] Show the debug toolbar on the front end & [] Show the debug toolbar on the Control Panel
 *
 * http://www.yiiframework.com/doc-2.0/guide-runtime-logging.html
 */
        Craft::info(
            Craft::t(
                'backend-google-analytics',
                '{name} plugin loaded',
                ['name' => $this->name]
            ),
            __METHOD__
        );
    }

    // Protected Methods
    // =========================================================================

    /**
     * Creates and returns the model used to store the plugin’s settings.
     *
     * @return \craft\base\Model|null
     */
    protected function createSettingsModel()
    {
        return new Settings();
    }

    /**
     * Returns the rendered settings HTML, which will be inserted into the content
     * block on the settings page.
     *
     * @return string The rendered settings HTML
     */
    protected function settingsHtml(): string
    {
        return Craft::$app->view->renderTemplate(
            'backend-google-analytics/settings',
            [
                'settings' => $this->getSettings()
            ]
        );
    }
}
