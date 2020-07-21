"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _uuid = require("uuid");

var _Model2 = _interopRequireDefault(require("./Model.model"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

/**
 * CloudEventModel class
 * Class to implement cloud events - https://github.com/cloudevents/spec/blob/master/spec.md
 */
var CloudEventModel = /*#__PURE__*/function (_Model) {
  _inherits(CloudEventModel, _Model);

  var _super = _createSuper(CloudEventModel);

  /**
   * CloudEventModel constructor
   */
  function CloudEventModel() {
    var _this;

    _classCallCheck(this, CloudEventModel);

    _this = _super.call(this);
    _this.cloudEventsVersion = '0.1';
    _this.eventType = '';
    _this.source = '';
    _this.eventID = (0, _uuid.v4)();
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
    key: "getCloudEventsVersion",
    value: function getCloudEventsVersion() {
      return this.cloudEventsVersion;
    }
    /**
     * Get event type
     * @return {string|*}
     */

  }, {
    key: "getEventType",
    value: function getEventType() {
      return this.eventType;
    }
    /**
     * Set event type
     * @param value string
     */

  }, {
    key: "setEventType",
    value: function setEventType(value) {
      this.eventType = value;
    }
    /**
     * Get source
     * @return {string|*}
     */

  }, {
    key: "getSource",
    value: function getSource() {
      return this.source;
    }
    /**
     * Set source
     * @param value string
     */

  }, {
    key: "setSource",
    value: function setSource(value) {
      this.source = value;
    }
    /**
     * Get event id
     * @return {*|string}
     */

  }, {
    key: "getEventID",
    value: function getEventID() {
      return this.eventID;
    }
    /**
     * Get event time
     * @return {*|string}
     */

  }, {
    key: "getEventTime",
    value: function getEventTime() {
      return this.eventTime;
    }
    /**
     * Get extensions
     * @return {{}|*}
     */

  }, {
    key: "getExtensions",
    value: function getExtensions() {
      return this.extensions;
    }
    /**
     * Set extensions
     * @param value object
     */

  }, {
    key: "setExtensions",
    value: function setExtensions(value) {
      this.extensions = value;
    }
    /**
     * Get content type
     * @return {string}
     */

  }, {
    key: "getContentType",
    value: function getContentType() {
      return this.contentType;
    }
    /**
     * Get data
     * @return {{}|*}
     */

  }, {
    key: "getData",
    value: function getData() {
      return this.data;
    }
    /**
     * Set data
     * @param value object
     */

  }, {
    key: "setData",
    value: function setData(value) {
      this.data = value;
    }
  }]);

  return CloudEventModel;
}(_Model2["default"]);

exports["default"] = CloudEventModel;