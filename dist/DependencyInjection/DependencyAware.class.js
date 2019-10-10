"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * DependencyAwareClass Class
 */
var DependencyAwareClass = function () {
  /**
   * DependencyAwareClass constructor
   * @param di DependencyInjection
   */
  function DependencyAwareClass(di) {
    _classCallCheck(this, DependencyAwareClass);

    this.di = di;
  }

  /**
   * Get Dependency Injection Container
   * @return DependencyInjection
   */


  _createClass(DependencyAwareClass, [{
    key: "getContainer",
    value: function getContainer() {
      return this.di;
    }
  }]);

  return DependencyAwareClass;
}();

exports.default = DependencyAwareClass;