'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LambdaWrapperV2 = exports.LambdaWrapper = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _iopipe = require('@iopipe/iopipe');

var _iopipe2 = _interopRequireDefault(_iopipe);

var _profiler = require('@iopipe/profiler');

var _profiler2 = _interopRequireDefault(_profiler);

var _trace = require('@iopipe/trace');

var _trace2 = _interopRequireDefault(_trace);

var _DependencyInjection = require('../DependencyInjection/DependencyInjection.class');

var _DependencyInjection2 = _interopRequireDefault(_DependencyInjection);

var _Dependencies = require('../Config/Dependencies');

var _Response = require('../Model/Response.model');

var _Response2 = _interopRequireDefault(_Response);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LambdaWrapper = exports.LambdaWrapper = function LambdaWrapper(configuration, handler) {
  var slimAction = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var _instance = function instance(event, context, callback) {
    var di = new _DependencyInjection2.default(configuration, event, context);
    var request = di.get(_Dependencies.DEFINITIONS.REQUEST);
    var logger = di.get(_Dependencies.DEFINITIONS.LOGGER);

    context.callbackWaitsForEmptyEventLoop = false;

    // If the event is to trigger a warm up, then don't bother returning the function.
    if (di.getEvent().source === 'serverless-plugin-warmup') {
      return callback(null, 'Lambda is warm!');
    }

    // Log the users ip address silently for use in error tracing
    if (request.getIp() !== null) {
      logger.metric('ipAddress', request.getIp(), true);
    }

    // Add metrics with user browser information for rapid debugging
    var userBrowserAndDevice = request.getUserBrowserAndDevice();
    if (userBrowserAndDevice !== null && (typeof userBrowserAndDevice === 'undefined' ? 'undefined' : _typeof(userBrowserAndDevice)) === 'object') {
      Object.keys(userBrowserAndDevice).forEach(function (metricKey) {
        logger.metric(metricKey, userBrowserAndDevice[metricKey], true);
      });
    }

    var handlerResponse = handler.call(_instance, di, request, callback);
    if (slimAction === true) {
      // Slim action by moving response handling logic here
      return handlerResponse.catch(function (error) {
        logger.error(error);
        return error instanceof _Response2.default ? error : new _Response2.default({}, 500, 'unknown error');
      }).then(function (response) {
        return callback(null, response instanceof _Response2.default ? response.generate() : response);
      });
    }
    return handlerResponse;
  };

  // If the IOPipe token is enabled, then wrap the instance in the IOPipe wrapper
  if (typeof process.env.IOPIPE_TOKEN === 'string' && process.env.IOPIPE_TOKEN !== 'undefined') {
    var ioPipeConfiguration = {
      plugins: [(0, _trace2.default)({
        autoHttp: {
          enabled: false
        }
      })]
    };

    if (typeof process.env.IOPIPE_TRACING !== 'undefined' && process.env.IOPIPE_TRACING === 'enabled') {
      ioPipeConfiguration.plugins.push((0, _profiler2.default)({ enabled: true, heapSnapshot: true }));
    }

    _instance = (0, _iopipe2.default)(ioPipeConfiguration)(_instance);
  }

  return _instance;
};

var LambdaWrapperV2 = exports.LambdaWrapperV2 = function LambdaWrapperV2(configuration, handler) {
  return LambdaWrapper(configuration, handler, true);
};