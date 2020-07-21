"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _winston = _interopRequireDefault(require("winston"));

var Sentry = _interopRequireWildcard(require("@sentry/node"));

var _epsagon = _interopRequireDefault(require("epsagon"));

var _DependencyAware = _interopRequireDefault(require("../DependencyInjection/DependencyAware.class"));

var _DependencyInjection = _interopRequireDefault(require("../DependencyInjection/DependencyInjection.class"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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

var logger = _winston["default"].createLogger({
  level: 'info',
  format: _winston["default"].format.combine(_winston["default"].format.json({
    replacer: function replacer(key, value) {
      if (value instanceof Buffer) {
        return value.toString('base64');
      } else if (value instanceof Error) {
        var error = {};
        Object.getOwnPropertyNames(value).forEach(function (objectKey) {
          error[objectKey] = value[objectKey];
        });
        return error;
      }

      return value;
    }
  })),
  transports: [new _winston["default"].transports.Console()]
}); // Instantiate the sentry client


var sentryIsAvailable = typeof process.env.RAVEN_DSN !== 'undefined' && typeof process.env.RAVEN_DSN === 'string' && process.env.RAVEN_DSN !== 'undefined';

if (sentryIsAvailable) {
  Sentry.init({
    dsn: process.env.RAVEN_DSN,
    shutdownTimeout: 5,
    environment: process.env.STAGE
  });
}
/**
 * LoggerService class
 */


var LoggerService = /*#__PURE__*/function (_DependencyAwareClass) {
  _inherits(LoggerService, _DependencyAwareClass);

  var _super = _createSuper(LoggerService);

  function LoggerService(di) {
    var _this;

    _classCallCheck(this, LoggerService);

    _this = _super.call(this, di);
    _this.sentry = null;

    var container = _this.getContainer();

    var event = container.getEvent();
    var context = container.getContext();
    var isOffline = !Object.prototype.hasOwnProperty.call(context, 'invokedFunctionArn') || context.invokedFunctionArn.indexOf('offline') !== -1; // Set sentry client context

    if (sentryIsAvailable && isOffline === false) {
      Sentry.configureScope(function (scope) {
        scope.setTags({
          Event: event,
          Context: context
        });
        scope.setExtras({
          lambda: context.functionName,
          memory_size: context.memoryLimitInMB,
          log_group: context.log_group_name,
          log_stream: context.log_stream_name,
          stage: process.env.STAGE,
          path: event.path,
          httpMethod: event.httpMethod
        });
      });
      _this.sentry = Sentry;
    }

    return _this;
  }
  /**
   * Log Error Message
   * @param error object
   * @param message string
   */


  _createClass(LoggerService, [{
    key: "error",
    value: function error(_error) {
      var message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      if (sentryIsAvailable && _error instanceof Error) {
        Sentry.captureException(_error);
      }

      if (typeof process.env.EPSAGON_TOKEN === 'string' && process.env.EPSAGON_TOKEN !== 'undefined' && typeof process.env.EPSAGON_SERVICE_NAME === 'string' && process.env.EPSAGON_SERVICE_NAME !== 'undefined' && _error instanceof Error) {
        _epsagon["default"].setError(_error);
      }

      logger.log('error', message, {
        error: _error
      });
      this.label('error', true);
      this.metric('error', 'error', true);
    }
    /**
     * Get sentry client
     * @return {null|*}
     */

  }, {
    key: "getSentry",
    value: function getSentry() {
      return this.sentry;
    }
    /**
     * Log Information Message
     * @param message string
     */

  }, {
    key: "info",
    value: function info(message) {
      logger.log('info', message);
    }
    /**
     * Add a label
     * @param descriptor string
     * @param silent     boolean
     */

  }, {
    key: "label",
    value: function label(descriptor) {
      var silent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (typeof process.env.EPSAGON_TOKEN === 'string' && process.env.EPSAGON_TOKEN !== 'undefined' && typeof process.env.EPSAGON_SERVICE_NAME === 'string' && process.env.EPSAGON_SERVICE_NAME !== 'undefined') {
        _epsagon["default"].label(descriptor);
      }

      if (silent === false) {
        logger.log('info', "label - ".concat(descriptor));
      }
    }
    /**
     * Add a metric
     * @param descriptor string
     * @param stat       integer | string
     * @param silent     boolean
     */

  }, {
    key: "metric",
    value: function metric(descriptor, stat) {
      var silent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      if (typeof process.env.EPSAGON_TOKEN === 'string' && process.env.EPSAGON_TOKEN !== 'undefined' && typeof process.env.EPSAGON_SERVICE_NAME === 'string' && process.env.EPSAGON_SERVICE_NAME !== 'undefined') {
        _epsagon["default"].label(descriptor, stat);
      }

      if (silent === false) {
        logger.log('info', "metric - ".concat(descriptor, " - ").concat(stat));
      }
    }
  }]);

  return LoggerService;
}(_DependencyAware["default"]);

exports["default"] = LoggerService;