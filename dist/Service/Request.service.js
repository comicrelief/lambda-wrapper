"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.ERROR_TYPES = exports.REQUEST_TYPES = void 0;

var _querystring = _interopRequireDefault(require("querystring"));

var _validate = _interopRequireDefault(require("validate.js/validate"));

var _xml2js = _interopRequireDefault(require("xml2js"));

var _useragent = _interopRequireDefault(require("useragent"));

var _DependencyAware = _interopRequireDefault(require("../DependencyInjection/DependencyAware.class"));

var _Response = _interopRequireDefault(require("../Model/Response.model"));

var _Dependencies = require("../Config/Dependencies");

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

var REQUEST_TYPES = {
  GET: 'GET',
  POST: 'POST'
}; // Define action specific error types

exports.REQUEST_TYPES = REQUEST_TYPES;
var ERROR_TYPES = {
  VALIDATION_ERROR: new _Response["default"]({}, 400, 'required fields are missing')
};
/**
 * RequestService class
 */

exports.ERROR_TYPES = ERROR_TYPES;

var RequestService = /*#__PURE__*/function (_DependencyAwareClass) {
  _inherits(RequestService, _DependencyAwareClass);

  var _super = _createSuper(RequestService);

  function RequestService() {
    _classCallCheck(this, RequestService);

    return _super.apply(this, arguments);
  }

  _createClass(RequestService, [{
    key: "get",

    /**
     * Get a parameter from the request.
     * @param param
     * @param ifNull
     * @param requestType
     * @return {*}
     */
    value: function get(param) {
      var ifNull = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var requestType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var queryParams = this.getAll(requestType);

      if (queryParams === null) {
        return ifNull;
      }

      return typeof queryParams[param] !== 'undefined' ? queryParams[param] : ifNull;
    }
    /**
     * Get authorization token
     * @return {*}
     */

  }, {
    key: "getAuthorizationToken",
    value: function getAuthorizationToken() {
      var _this$getContainer$ge = this.getContainer().getEvent(),
          headers = _this$getContainer$ge.headers;

      if (typeof headers.Authorization === 'undefined' && typeof headers.authorization === 'undefined') {
        return null;
      }

      var tokenParts = headers[typeof headers.Authorization === 'undefined' ? 'authorization' : 'Authorization'].split(' ');
      var tokenValue = tokenParts[1];

      if (!(tokenParts[0].toLowerCase() === 'bearer' && tokenValue)) {
        return null;
      }

      return tokenValue;
    }
    /**
     * Get a path parameter
     * @param param  string|null
     * @param ifNull mixed
     * @return {*}
     */

  }, {
    key: "getPathParameter",
    value: function getPathParameter() {
      var param = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var ifNull = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var event = this.getContainer().getEvent(); // If no parameter has been requested, return all path parameters

      if (param === null && _typeof(event.pathParameters) === 'object') {
        return event.pathParameters;
      } // If a specifc parameter has been requested, return the parameter if it exists


      if (typeof param === 'string' && _typeof(event.pathParameters) === 'object' && event.pathParameters !== null && typeof event.pathParameters[param] !== 'undefined') {
        return event.pathParameters[param];
      }

      return ifNull;
    }
    /**
     * Get all request parameters
     * @param requestType
     * @return {{}}
     */

  }, {
    key: "getAll",
    value: function getAll() {
      var requestType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var event = this.getContainer().getEvent();

      if (event.httpMethod === 'GET' || requestType === REQUEST_TYPES.GET) {
        return typeof event.queryStringParameters !== 'undefined' ? event.queryStringParameters : {};
      }

      if (event.httpMethod === 'POST' || requestType === REQUEST_TYPES.POST) {
        var queryParams = {};

        if (typeof event.headers['Content-Type'] !== 'undefined' && event.headers['Content-Type'].indexOf('application/x-www-form-urlencoded') !== -1 || typeof event.headers['content-type'] !== 'undefined' && event.headers['content-type'].indexOf('application/x-www-form-urlencoded') !== -1) {
          queryParams = _querystring["default"].parse(event.body);
        }

        if (typeof event.headers['Content-Type'] !== 'undefined' && event.headers['Content-Type'].indexOf('application/json') !== -1 || typeof event.headers['content-type'] !== 'undefined' && event.headers['content-type'].indexOf('application/json') !== -1) {
          try {
            queryParams = JSON.parse(event.body);
          } catch (e) {
            queryParams = {};
          }
        }

        if (typeof event.headers['Content-Type'] !== 'undefined' && event.headers['Content-Type'].indexOf('text/xml') !== -1 || typeof event.headers['content-type'] !== 'undefined' && event.headers['content-type'].indexOf('text/xml') !== -1) {
          _xml2js["default"].parseString(event.body, function (err, result) {
            if (err) {
              queryParams = {};
            } else {
              queryParams = result;
            }
          });
        }

        if (typeof event.headers['Content-Type'] !== 'undefined' && event.headers['Content-Type'].indexOf('multipart/form-data') !== -1 || typeof event.headers['content-type'] !== 'undefined' && event.headers['content-type'].indexOf('multipart/form-data') !== -1) {
          queryParams = this.parseForm(true);
        }

        return typeof queryParams !== 'undefined' ? queryParams : {};
      }

      return null;
    }
    /**
     * Fetch the request IP address
     * @return {*}
     */

  }, {
    key: "getIp",
    value: function getIp() {
      var event = this.getContainer().getEvent();

      if (typeof event.requestContext !== 'undefined' && typeof event.requestContext.identity !== 'undefined' && typeof event.requestContext.identity.sourceIp !== 'undefined') {
        return event.requestContext.identity.sourceIp;
      }

      return null;
    }
    /**
     * Get user agent
     * @return {*}
     */

  }, {
    key: "getUserBrowserAndDevice",
    value: function getUserBrowserAndDevice() {
      var _this$getContainer$ge2 = this.getContainer().getEvent(),
          headers = _this$getContainer$ge2.headers;

      var userAgent = null;

      if (_typeof(headers) !== 'object') {
        return null;
      }

      Object.keys(headers).forEach(function (header) {
        if (header.toUpperCase() === 'USER-AGENT') {
          userAgent = headers[header];
        }
      });

      if (userAgent === null) {
        return null;
      }

      try {
        var agent = _useragent["default"].parse(userAgent);

        var os = agent.os.toJSON();
        return {
          'browser-type': agent.family,
          'browser-version': agent.toVersion(),
          'device-type': agent.device.family,
          'operating-system': os.family,
          'operating-system-version': agent.os.toVersion()
        };
      } catch (error) {
        this.getContainer().get(_Dependencies.DEFINITIONS.LOGGER).label('user-agent-parsing-failed');
        return null;
      }
    }
    /**
     * Test a request against validation constraints
     * @param constraints
     * @return {Promise<any>}
     */

  }, {
    key: "validateAgainstConstraints",
    value: function validateAgainstConstraints(constraints) {
      var _this = this;

      var Logger = this.getContainer().get(_Dependencies.DEFINITIONS.LOGGER);
      return new Promise(function (resolve, reject) {
        var validation = (0, _validate["default"])(_this.getAll(), constraints);

        if (typeof validation === 'undefined') {
          resolve();
        } else {
          Logger.label('request-validation-failed');
          var validationErrorResponse = ERROR_TYPES.VALIDATION_ERROR;
          validationErrorResponse.setBodyVariable('validation_errors', validation);
          reject(validationErrorResponse);
        }
      });
    }
    /**
     * Fetch the request multipart form
     * @param useBuffer
     * @return {*}
     */

  }, {
    key: "parseForm",
    value: function parseForm(useBuffer) {
      var event = this.getContainer().getEvent();
      var boundary = this.getBoundary(event);
      var body = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('binary').trim() : event.body;
      var result = {};
      body.split(boundary).forEach(function (item) {
        if (/filename=".+"/g.test(item)) {
          result[item.match(/name=".+";/g)[0].slice(6, -2)] = {
            type: 'file',
            filename: item.match(/filename=".+"/g)[0].slice(10, -1),
            contentType: item.match(/Content-Type:\s.+/g)[0].slice(14),
            content: useBuffer ? Buffer.from(item.slice(item.search(/Content-Type:\s.+/g) + item.match(/Content-Type:\s.+/g)[0].length + 4, -4), 'binary') : item.slice(item.search(/Content-Type:\s.+/g) + item.match(/Content-Type:\s.+/g)[0].length + 4, -4)
          };
        } else if (/name=".+"/g.test(item)) {
          result[item.match(/name=".+"/g)[0].slice(6, -1)] = item.slice(item.search(/name=".+"/g) + item.match(/name=".+"/g)[0].length + 4, -4);
        }
      });
      return result;
    }
    /**
     * Fetch the request AWS event Records
     * @return {*}
     */

  }, {
    key: "getAWSRecords",
    value: function getAWSRecords() {
      var event = this.getContainer().getEvent();
      var eventRecord = event.Records && event.Records[0];

      if (typeof event.Records !== 'undefined' && typeof event.Records[0] !== 'undefined' && typeof eventRecord.eventSource !== 'undefined') {
        return eventRecord;
      }

      return null;
    }
  }, {
    key: "getValueIgnoringKeyCase",
    value: function getValueIgnoringKeyCase(object, key) {
      var foundKey = Object.keys(object).find(function (currentKey) {
        return currentKey.toLocaleLowerCase() === key.toLowerCase();
      });
      return object[foundKey];
    }
  }, {
    key: "getBoundary",
    value: function getBoundary(event) {
      return this.getValueIgnoringKeyCase(event.headers, 'Content-Type').split('=')[1];
    }
  }]);

  return RequestService;
}(_DependencyAware["default"]);

exports["default"] = RequestService;