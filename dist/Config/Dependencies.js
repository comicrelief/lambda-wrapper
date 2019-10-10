'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DEPENDENCIES = exports.DEFINITIONS = undefined;

var _DEPENDENCIES;

var _Logger = require('../Service/Logger.service');

var _Logger2 = _interopRequireDefault(_Logger);

var _Request = require('../Service/Request.service');

var _Request2 = _interopRequireDefault(_Request);

var _SQS = require('../Service/SQS.service');

var _SQS2 = _interopRequireDefault(_SQS);

var _Timer = require('../Service/Timer.service');

var _Timer2 = _interopRequireDefault(_Timer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var DEFINITIONS = exports.DEFINITIONS = {
  LOGGER: 'LOGGER',
  REQUEST: 'REQUEST',
  SQS: 'SQS',
  TIMER: 'TIMER'
};

var DEPENDENCIES = exports.DEPENDENCIES = (_DEPENDENCIES = {}, _defineProperty(_DEPENDENCIES, DEFINITIONS.LOGGER, _Logger2.default), _defineProperty(_DEPENDENCIES, DEFINITIONS.REQUEST, _Request2.default), _defineProperty(_DEPENDENCIES, DEFINITIONS.SQS, _SQS2.default), _defineProperty(_DEPENDENCIES, DEFINITIONS.TIMER, _Timer2.default), _DEPENDENCIES);

exports.default = {
  DEFINITIONS: DEFINITIONS,
  DEPENDENCIES: DEPENDENCIES
};