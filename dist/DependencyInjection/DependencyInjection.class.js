'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Dependencies = require('../Config/Dependencies');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * DependencyInjection class
 */
var DependencyInjection = function () {
  /**
   * DependencyInjection constructor
   * @param configuration
   * @param event
   * @param context
   */
  function DependencyInjection(configuration, event, context) {
    var _this = this;

    _classCallCheck(this, DependencyInjection);

    this.event = event;
    this.context = context;

    this.dependencies = {};
    this.configuration = configuration;

    for (var x = 0; x <= 1; x += 1) {
      // Iterate over lapper dependencies and add to container
      Object.keys(_Dependencies.DEFINITIONS).forEach(function (dependencyKey) {
        _this.dependencies[dependencyKey] = new _Dependencies.DEPENDENCIES[dependencyKey](_this);
      });

      // Iterate over child dependencies and add to container
      if (typeof configuration.DEPENDENCIES !== 'undefined') {
        Object.keys(configuration.DEPENDENCIES).forEach(function (dependencyKey) {
          _this.dependencies[dependencyKey] = new configuration.DEPENDENCIES[dependencyKey](_this);
        });
      }
    }
  }

  /**
   * Get Dependency
   * @param definition
   * @return {*}
   */


  _createClass(DependencyInjection, [{
    key: 'get',
    value: function get(definition) {
      if (typeof this.dependencies[definition] === 'undefined') {
        throw Error(definition + ' does not exist in di container');
      }

      return this.dependencies[definition];
    }

    /**
     * Get Event
     * @return {*}
     */

  }, {
    key: 'getEvent',
    value: function getEvent() {
      return this.event;
    }

    /**
     * Get Context
     * @return {*}
     */

  }, {
    key: 'getContext',
    value: function getContext() {
      return this.context;
    }

    /**
     * Get Configuration
     * @param definition string
     * @return {*}
     */

  }, {
    key: 'getConfiguration',
    value: function getConfiguration() {
      var definition = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      if (definition !== null && typeof this.configuration[definition] === 'undefined') {
        return null;
      } else if (typeof this.configuration[definition] !== 'undefined') {
        return this.configuration[definition];
      }

      return this.configuration;
    }
  }]);

  return DependencyInjection;
}();

exports.default = DependencyInjection;