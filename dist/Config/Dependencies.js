"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.DEPENDENCIES = exports.DEFINITIONS = void 0;

var _Logger = _interopRequireDefault(require("../Service/Logger.service"));

var _Request = _interopRequireDefault(require("../Service/Request.service"));

var _SQS = _interopRequireDefault(require("../Service/SQS.service"));

var _Timer = _interopRequireDefault(require("../Service/Timer.service"));

var _DEPENDENCIES;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var DEFINITIONS = {
  LOGGER: 'LOGGER',
  REQUEST: 'REQUEST',
  SQS: 'SQS',
  TIMER: 'TIMER'
};
exports.DEFINITIONS = DEFINITIONS;
var DEPENDENCIES = (_DEPENDENCIES = {}, _defineProperty(_DEPENDENCIES, DEFINITIONS.LOGGER, _Logger["default"]), _defineProperty(_DEPENDENCIES, DEFINITIONS.REQUEST, _Request["default"]), _defineProperty(_DEPENDENCIES, DEFINITIONS.SQS, _SQS["default"]), _defineProperty(_DEPENDENCIES, DEFINITIONS.TIMER, _Timer["default"]), _DEPENDENCIES);
exports.DEPENDENCIES = DEPENDENCIES;
var _default = {
  DEFINITIONS: DEFINITIONS,
  DEPENDENCIES: DEPENDENCIES
};
exports["default"] = _default;