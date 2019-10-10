'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DEFAULT_MESSAGE = exports.RESPONSE_HEADERS = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Model2 = require('./Model.model');

var _Model3 = _interopRequireDefault(_Model2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 *
 * @type {object}
 */
var RESPONSE_HEADERS = exports.RESPONSE_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*', // Required for CORS support to work
  'Access-Control-Allow-Credentials': true // Required for cookies, authorization headers with HTTPS
};

/**
 * Default message provided as part of response
 * @type {string}
 */
var DEFAULT_MESSAGE = exports.DEFAULT_MESSAGE = 'success';

/**
 * class ResponseModel
 */

var ResponseModel = function (_Model) {
  _inherits(ResponseModel, _Model);

  /**
   * ResponseModel Constructor
   * @param data
   * @param code
   * @param message
   */
  function ResponseModel() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var code = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var message = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    _classCallCheck(this, ResponseModel);

    var _this = _possibleConstructorReturn(this, (ResponseModel.__proto__ || Object.getPrototypeOf(ResponseModel)).call(this));

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
    key: 'setBodyVariable',
    value: function setBodyVariable(variable, value) {
      this.body[variable] = value;
    }

    /**
     * Set Data
     * @param data
     */

  }, {
    key: 'setData',
    value: function setData(data) {
      this.body.data = data;
    }

    /**
     * Set Status Code
     * @param code
     */

  }, {
    key: 'setCode',
    value: function setCode(code) {
      this.code = code;
    }

    /**
     * Get Status Code
     * @return {*}
     */

  }, {
    key: 'getCode',
    value: function getCode() {
      return this.code;
    }

    /**
     * Set message
     * @param message
     */

  }, {
    key: 'setMessage',
    value: function setMessage(message) {
      this.body.message = message;
    }

    /**
     * Get Message
     * @return {string|*}
     */

  }, {
    key: 'getMessage',
    value: function getMessage() {
      return this.body.message;
    }

    /**
     * Geneate a response
     * @return {object}
     */

  }, {
    key: 'generate',
    value: function generate() {
      return {
        statusCode: this.code,
        headers: RESPONSE_HEADERS,
        body: JSON.stringify(this.body)
      };
    }
  }]);

  return ResponseModel;
}(_Model3.default);

exports.default = ResponseModel;