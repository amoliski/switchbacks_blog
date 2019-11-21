<?php
/**
 * AWSImageTransform plugin for Craft CMS 3.x
 *
 * Creates a twig extension that allows the template to make easy calls to an AWS serverless image transform server
 *
 * @link      moliski.net
 * @copyright Copyright (c) 2019 Adam Moliski
 */

namespace moliski\awsimagetransform;

use moliski\awsimagetransform\models\Settings;

use Craft;
use craft\base\Plugin;
use craft\services\Plugins;
use craft\events\PluginEvent;
use craft\elements\Asset;
use craft\services\Assets;
use craft\events\GetAssetThumbUrlEvent;

use yii\base\Event;

/**
 *
 * @author    Adam Moliski
 * @package   AWSImageTransform
 * @since     1.0.0
 *
 */

class AWSImageTransformProvider extends \Twig\Extension\AbstractExtension
{

    public function getFunctions()
    {
        return [
            new \Twig\TwigFunction('get_image', [$this, 'get_image']),
            new \Twig\TwigFunction('get_image_from_media', [$this, 'get_image_from_media']),
            new \Twig\TwigFunction('get_srcset_from_media', [$this, 'get_srcset_from_media']),
        ];
    }

    public function get_image($key, $options){
        $request = [
            "bucket"=>"switchbacks",
            "key"=>"media/".$key,
            "edits"=>$options,
        ];
        return "https://d3bnfnztujavng.cloudfront.net/".base64_encode(json_encode($request));
    }

    public function get_image_from_media($media, $width=0, $height=0, $index=0){
        $result = 'https://placehold.it/'.($width > 0 ? $width : $height)."x".$height;

        if($media && count($media) > 0){
            $image_path = $media[0]->folderPath . $media[0]->filename;
            return $this->get_image($image_path, ["resize"=>["fit"=>'cover', 'height'=>$height, 'width'=>$width]]);
        }
        return $result;
    }
    public function get_srcset_from_media($media, $sizes, $index = 0){
        $result = "";
        foreach($sizes as &$size){
            $result .= $this->get_image_from_media($media, $size, 0, $index)." ".$size."w,";
        }
        return $result;

    }


}


class AWSImageTransform extends Plugin
{
    // Static Properties
    // =========================================================================
    public static $plugin;
    public $schemaVersion = '1.0.0';

    public function init()
    {
        parent::init();
        self::$plugin = $this;

        // Register the twig functions if it's not a control panel request
        if(Craft::$app->request->getIsSiteRequest()){
            $extension = new AWSImageTransformProvider();
            Craft::$app->view->registerTwigExtension($extension);
        }

       Event::on(Assets::class, Assets::EVENT_GET_ASSET_THUMB_URL, function (GetAssetThumbUrlEvent $event) {



            $asset = $event->asset;
            $width =  $event->width;
            $height =  $event->height;
            $result = 'https://placehold.it/'.($width > 0 ? $width : $height)."x".$height;

           //$data = print_r($event->asset, true);
           Craft::error(
             Craft::t(
                 'awsimage-transform',
                 get_class($asset->volume) == 'craft\awss3\Volume',
                 //print_r($asset->volume, true),
                 ['name' => $this->name]
             ),
             __METHOD__
         );

            if(get_class($asset->volume) == 'craft\awss3\Volume'){
                $volume = $asset->volume;
                //print_r($volume);
               $image_path = $event->asset->folderPath . $event->asset->filename;
               $options = ["resize"=>["fit"=>'cover', 'height'=>$height, 'width'=>$width]];
                $request = [
                           "bucket"=>$volume->bucket,
                           "key"=>$volume->subfolder."/".$image_path,
                           "edits"=>$options,
                       ];
               $event -> handled = true;
               $result = "https://d3bnfnztujavng.cloudfront.net/".base64_encode(json_encode($request));
                $event->url = $result;
            }
       });

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
                'awsimage-transform',
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
            'awsimage-transform/settings',
            [
                'settings' => $this->getSettings()
            ]
        );
    }
}
