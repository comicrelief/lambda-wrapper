"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _epsagon = _interopRequireDefault(require("epsagon"));

var _DependencyInjection = _interopRequireDefault(require("../DependencyInjection/DependencyInjection.class"));

var _Dependencies = require("../Config/Dependencies");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var _default = function _default(configuration, handler) {
  var _instance = function instance(event, context, callback) {
    var di = new _DependencyInjection["default"](configuration, event, context);
    var request = di.get(_Dependencies.DEFINITIONS.REQUEST);
    var logger = di.get(_Dependencies.DEFINITIONS.LOGGER);
    context.callbackWaitsForEmptyEventLoop = false; // If the event is to trigger a warm up, then don't bother returning the function.

    if (di.getEvent().source === 'serverless-plugin-warmup') {
      return callback(null, 'Lambda is warm!');
    } // Log the users ip address silently for use in error tracing


    if (request.getIp() !== null) {
      logger.metric('ipAddress', request.getIp(), true);
    } // Add metrics with user browser information for rapid debugging


    var userBrowserAndDevice = request.getUserBrowserAndDevice();

    if (userBrowserAndDevice !== null && _typeof(userBrowserAndDevice) === 'object') {
      Object.keys(userBrowserAndDevice).forEach(function (metricKey) {
        logger.metric(metricKey, userBrowserAndDevice[metricKey], true);
      });
    }

    return handler.call(_instance, di, request, callback);
  }; // If the Epsagon token is enabled, then wrap the instance in the Epsagon wrapper


  if (typeof process.env.EPSAGON_TOKEN === 'string' && process.env.EPSAGON_TOKEN !== 'undefined' && typeof process.env.EPSAGON_SERVICE_NAME === 'string' && process.env.EPSAGON_SERVICE_NAME !== 'undefined') {
    _epsagon["default"].init({
      token: process.env.EPSAGON_TOKEN,
      appName: process.env.EPSAGON_SERVICE_NAME
    });

    _instance = _epsagon["default"].lambdaWrapper(_instance);
  }

  return _instance;
};

exports["default"] = _default;