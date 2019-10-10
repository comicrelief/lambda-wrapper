'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _raven = require('raven');

var _raven2 = _interopRequireDefault(_raven);

var _DependencyAware = require('../DependencyInjection/DependencyAware.class');

var _DependencyAware2 = _interopRequireDefault(_DependencyAware);

var _DependencyInjection = require('../DependencyInjection/DependencyInjection.class');

var _DependencyInjection2 = _interopRequireDefault(_DependencyInjection);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var logger = _winston2.default.createLogger({
  level: 'info',
  format: _winston2.default.format.combine(_winston2.default.format.json({
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
  transports: [new _winston2.default.transports.Console()]
});

// Instantiate the raven client
var ravenIsAvailable = typeof process.env.RAVEN_DSN !== 'undefined' && typeof process.env.RAVEN_DSN === 'string' && process.env.RAVEN_DSN !== 'undefined';

if (ravenIsAvailable) {
  _raven2.default.config(process.env.RAVEN_DSN, {
    sendTimeout: 5,
    environment: process.env.STAGE
  }).install();
}

/**
 * LoggerService class
 */

var LoggerService = function (_DependencyAwareClass) {
  _inherits(LoggerService, _DependencyAwareClass);

  function LoggerService(di) {
    _classCallCheck(this, LoggerService);

    var _this = _possibleConstructorReturn(this, (LoggerService.__proto__ || Object.getPrototypeOf(LoggerService)).call(this, di));

    _this.raven = null;
    var container = _this.getContainer();
    var event = container.getEvent();
    var context = container.getContext();
    var isOffline = !Object.prototype.hasOwnProperty.call(context, 'invokedFunctionArn') || context.invokedFunctionArn.indexOf('offline') !== -1;

    // Set raven client context
    if (ravenIsAvailable && isOffline === false) {
      _raven2.default.setContext({
        extra: {
          Event: event,
          Context: context
        },
        environment: process.env.STAGE,
        tags: {
          lambda: context.functionName,
          memory_size: context.memoryLimitInMB,
          log_group: context.log_group_name,
          log_stream: context.log_stream_name,
          stage: process.env.STAGE,
          path: event.path,
          httpMethod: event.httpMethod
        }
      });

      _this.raven = _raven2.default;
    }
    return _this;
  }

  /**
   * Log Error Message
   * @param error object
   * @param message string
   */


  _createClass(LoggerService, [{
    key: 'error',
    value: function error(_error) {
      var message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      if (ravenIsAvailable && _error instanceof Error) {
        _raven2.default.captureException(_error);
      }

      logger.log('error', message, { error: _error });
      this.label('error', true);
      this.metric('error', 'error', true);
    }

    /**
     * Get raven client
     * @return {null|*}
     */

  }, {
    key: 'getRaven',
    value: function getRaven() {
      return this.raven;
    }

    /**
     * Log Information Message
     * @param message string
     */

  }, {
    key: 'info',
    value: function info(message) {
      logger.log('info', message);
    }

    /**
     * Add a label
     * @param descriptor string
     * @param silent     boolean
     */

  }, {
    key: 'label',
    value: function label(descriptor) {
      var silent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (typeof process.env.IOPIPE_TOKEN === 'string' && process.env.IOPIPE_TOKEN !== 'undefined') {
        this.getContainer().getContext().iopipe.label(descriptor);
      }

      if (silent === false) {
        logger.log('info', 'label - ' + descriptor);
      }
    }

    /**
     * Add a metric
     * @param descriptor string
     * @param stat       integer | string
     * @param silent     boolean
     */

  }, {
    key: 'metric',
    value: function metric(descriptor, stat) {
      var silent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      if (typeof process.env.IOPIPE_TOKEN === 'string' && process.env.IOPIPE_TOKEN !== 'undefined') {
        this.getContainer().getContext().iopipe.metric(descriptor, stat);
      }

      if (silent === false) {
        logger.log('info', 'metric - ' + descriptor + ' - ' + stat);
      }
    }
  }]);

  return LoggerService;
}(_DependencyAware2.default);

exports.default = LoggerService;