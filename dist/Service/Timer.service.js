'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _DependencyAware = require('../DependencyInjection/DependencyAware.class');

var _DependencyAware2 = _interopRequireDefault(_DependencyAware);

var _DependencyInjection = require('../DependencyInjection/DependencyInjection.class');

var _DependencyInjection2 = _interopRequireDefault(_DependencyInjection);

var _Dependencies = require('../Config/Dependencies');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * TimerService class
 */
var TimerService = function (_DependencyAwareClass) {
  _inherits(TimerService, _DependencyAwareClass);

  /**
   * TimerService constructor
   * @param di
   */
  function TimerService(di) {
    _classCallCheck(this, TimerService);

    var _this = _possibleConstructorReturn(this, (TimerService.__proto__ || Object.getPrototypeOf(TimerService)).call(this, di));

    _this.timers = {};
    return _this;
  }

  /**
   * Start timer
   * @param identifier
   */


  _createClass(TimerService, [{
    key: 'start',
    value: function start(identifier) {
      this.timers[identifier] = new Date().getTime();

      if (typeof process.env.IOPIPE_TOKEN === 'string' && process.env.IOPIPE_TOKEN !== 'undefined') {
        this.getContainer().getContext().iopipe.mark.start(identifier);
      }
    }

    /**
     * Stop timer
     * @param identifier
     */

  }, {
    key: 'stop',
    value: function stop(identifier) {
      if (typeof this.timers[identifier] !== 'undefined') {
        var duration = new Date().getTime() - this.timers[identifier];

        this.getContainer().get(_Dependencies.DEFINITIONS.LOGGER).info('Timing - ' + identifier + ' took ' + duration + 'ms to complete');
      }

      if (typeof process.env.IOPIPE_TOKEN === 'string' && process.env.IOPIPE_TOKEN !== 'undefined') {
        this.getContainer().getContext().iopipe.mark.end(identifier);
      }
    }
  }]);

  return TimerService;
}(_DependencyAware2.default);

exports.default = TimerService;