"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var STANDARD_LATENCY_DELAYS = {
  2000: 70,
  3500: 15,
  4000: 10,
  5000: 5
};
var HIGH_LATENCY_DELAYS = {
  2000: 65,
  3500: 15,
  4000: 9,
  5000: 5,
  10000: 5,
  20000: 1
};
/**
 * PromisifiedDelay class
 */

var PromisifiedDelay = /*#__PURE__*/function () {
  /**
   * PromisifiedDelay constructor
   */
  function PromisifiedDelay() {
    var _this = this;

    var highLatency = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

    _classCallCheck(this, PromisifiedDelay);

    this.delays = [];
    var delayArray = highLatency === true ? HIGH_LATENCY_DELAYS : STANDARD_LATENCY_DELAYS;
    Object.keys(delayArray).forEach(function (delayDuration) {
      var delayIterations = delayArray[delayDuration];

      for (var i = 0; i < delayIterations; i += 1) {
        _this.delays.push(delayDuration);
      }
    });
  }
  /**
   * Create a promisified delay
   * @return {Promise<any>}
   */


  _createClass(PromisifiedDelay, [{
    key: "get",
    value: function get() {
      var _this2 = this;

      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve();
        }, _this2.delays[Math.floor(Math.random() * _this2.delays.length)]);
      });
    }
  }]);

  return PromisifiedDelay;
}();

exports["default"] = PromisifiedDelay;