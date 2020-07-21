"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _validate = _interopRequireDefault(require("validate.js/validate"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Model = /*#__PURE__*/function () {
  function Model() {
    _classCallCheck(this, Model);
  }

  _createClass(Model, [{
    key: "instantiateFunctionWithDefinedValue",

    /**
     * Instantiate a function with a value if defined
     * @param classFunctionName string
     * @param value             mixed
     */
    value: function instantiateFunctionWithDefinedValue(classFunctionName, value) {
      if (typeof value !== 'undefined') {
        this[classFunctionName](value);
      }
    }
    /**
     * Validate values against constraints
     * @param values      object
     * @param constraints object
     * @return {boolean}
     */

  }, {
    key: "validateAgainstConstraints",
    value: function validateAgainstConstraints(values, constraints) {
      var validation = (0, _validate["default"])(values, constraints);
      return typeof validation === 'undefined';
    }
  }]);

  return Model;
}();

exports["default"] = Model;