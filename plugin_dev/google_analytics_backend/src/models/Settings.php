<?php
/**
 * BackendGoogleAnalytics plugin for Craft CMS 3.x
 *
 * Allows submitting analytical data to GA without relying on the (blockable) frontend JS code
 *
 * @link      moliski.net
 * @copyright Copyright (c) 2019 Adam Moliski
 */

namespace moliski\backendgoogleanalytics\models;

use moliski\backendgoogleanalytics\BackendGoogleAnalytics;

use Craft;
use craft\base\Model;

/**
 * BackendGoogleAnalytics Settings Model
 *
 * This is a model used to define the plugin's settings.
 *
 * Models are containers for data. Just about every time information is passed
 * between services, controllers, and templates in Craft, it’s passed via a model.
 *
 * https://craftcms.com/docs/plugins/models
 *
 * @author    Adam Moliski
 * @package   BackendGoogleAnalytics
 * @since     0.0.1
 */
class Settings extends Model
{
    // Public Properties
    // =========================================================================

    /**
     * Some field model attribute
     *
     * @var string
     */
    public $tracking_id = '';

    // Public Methods
    // =========================================================================

    /**
     * Returns the validation rules for attributes.
     *
     * Validation rules are used by [[validate()]] to check if attribute values are valid.
     * Child classes may override this method to declare different validation rules.
     *
     * More info: http://www.yiiframework.com/doc-2.0/guide-input-validation.html
     *
     * @return array
     */
    public function rules()
    {
        return [
            ['tracking_id', 'string'],
            ['tracking_id', 'default', 'value' => ''],
        ];
    }
}
