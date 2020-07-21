"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.DEFAULT_MESSAGE = exports.RESPONSE_HEADERS = void 0;

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
 *
 * @type {object}
 */
var RESPONSE_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  // Required for CORS support to work
  'Access-Control-Allow-Credentials': true // Required for cookies, authorization headers with HTTPS

};
/**
 * Default message provided as part of response
 * @type {string}
 */

exports.RESPONSE_HEADERS = RESPONSE_HEADERS;
var DEFAULT_MESSAGE = 'success';
/**
 * class ResponseModel
 */

exports.DEFAULT_MESSAGE = DEFAULT_MESSAGE;

var ResponseModel = /*#__PURE__*/function (_Model) {
  _inherits(ResponseModel, _Model);

  var _super = _createSuper(ResponseModel);

  /**
   * ResponseModel Constructor
   * @param data
   * @param code
   * @param message
   */
  function ResponseModel() {
    var _this;

    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var code = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var message = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    _classCallCheck(this, ResponseModel);

    _this = _super.call(this);
    _this.body = {
      data: data !== null ? data : {},
      message: message !== null ? message : DEFAULT_MESSAGE
    };
    _this.code = code !== null ? code : {};
    return _this;
  }
  /**
   * Add or update a body variable
   * @param variable
   * @param value
   */


  _createClass(ResponseModel, [{
    key: "setBodyVariable",
    value: function setBodyVariable(variable, value) {
      this.body[variable] = value;
    }
    /**
     * Set Data
     * @param data
     */

  }, {
    key: "setData",
    value: function setData(data) {
      this.body.data = data;
    }
    /**
     * Set Status Code
     * @param code
     */

  }, {
    key: "setCode",
    value: function setCode(code) {
      this.code = code;
    }
    /**
     * Get Status Code
     * @return {*}
     */

  }, {
    key: "getCode",
    value: function getCode() {
      return this.code;
    }
    /**
     * Set message
     * @param message
     */

  }, {
    key: "setMessage",
    value: function setMessage(message) {
      this.body.message = message;
    }
    /**
     * Get Message
     * @return {string|*}
     */

  }, {
    key: "getMessage",
    value: function getMessage() {
      return this.body.message;
    }
    /**
     * Geneate a response
     * @return {object}
     */

  }, {
    key: "generate",
    value: function generate() {
      return {
        statusCode: this.code,
        headers: RESPONSE_HEADERS,
        body: JSON.stringify(this.body)
      };
    }
  }]);

  return ResponseModel;
}(_Model2["default"]);

exports["default"] = ResponseModel;