'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _v = require('uuid/v4');

var _v2 = _interopRequireDefault(_v);

var _Model2 = require('./Model.model');

var _Model3 = _interopRequireDefault(_Model2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * CloudEventModel class
 * Class to implement cloud events - https://github.com/cloudevents/spec/blob/master/spec.md
 */
var CloudEventModel = function (_Model) {
  _inherits(CloudEventModel, _Model);

  /**
   * CloudEventModel constructor
   */
  function CloudEventModel() {
    _classCallCheck(this, CloudEventModel);

    var _this = _possibleConstructorReturn(this, (CloudEventModel.__proto__ || Object.getPrototypeOf(CloudEventModel)).call(this));

    _this.cloudEventsVersion = '0.1';
    _this.eventType = '';
    _this.source = '';
    _this.eventID = (0, _v2.default)();
    _this.eventTime = new Date().toISOString();
    _this.extensions = {};
    _this.contentType = 'application/json';
    _this.data = {};
    return _this;
  }

  /**
   * Get Cloud Events Version
   * @return {number}
   */


  _createClass(CloudEventModel, [{
    key: 'getCloudEventsVersion',
    value: function getCloudEventsVersion() {
      return this.cloudEventsVersion;
    }

    /**
     * Get event type
     * @return {string|*}
     */

  }, {
    key: 'getEventType',
    value: function getEventType() {
      return this.eventType;
    }

    /**
     * Set event type
     * @param value string
     */

  }, {
    key: 'setEventType',
    value: function setEventType(value) {
      this.eventType = value;
    }

    /**
     * Get source
     * @return {string|*}
     */

  }, {
    key: 'getSource',
    value: function getSource() {
      return this.source;
    }

    /**
     * Set source
     * @param value string
     */

  }, {
    key: 'setSource',
    value: function setSource(value) {
      this.source = value;
    }

    /**
     * Get event id
     * @return {*|string}
     */

  }, {
    key: 'getEventID',
    value: function getEventID() {
      return this.eventID;
    }

    /**
     * Get event time
     * @return {*|string}
     */

  }, {
    key: 'getEventTime',
    value: function getEventTime() {
      return this.eventTime;
    }

    /**
     * Get extensions
     * @return {{}|*}
     */

  }, {
    key: 'getExtensions',
    value: function getExtensions() {
      return this.extensions;
    }

    /**
     * Set extensions
     * @param value object
     */

  }, {
    key: 'setExtensions',
    value: function setExtensions(value) {
      this.extensions = value;
    }

    /**
     * Get content type
     * @return {string}
     */

  }, {
    key: 'getContentType',
    value: function getContentType() {
      return this.contentType;
    }

    /**
     * Get data
     * @return {{}|*}
     */

  }, {
    key: 'getData',
    value: function getData() {
      return this.data;
    }

    /**
     * Set data
     * @param value object
     */

  }, {
    key: 'setData',
    value: function setData(value) {
      this.data = value;
    }
  }]);

  return CloudEventModel;
}(_Model3.default);

exports.default = CloudEventModel;