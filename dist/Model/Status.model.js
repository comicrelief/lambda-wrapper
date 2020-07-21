"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.STATUS_TYPES = void 0;

var _Model2 = _interopRequireDefault(require("./Model.model"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var STATUS_TYPES = {
  OK: 'OK',
  ACCEPTABLE_FAILURE: 'ACCEPTABLE_FAILURE',
  APPLICATION_FAILURE: 'APPLICATION_FAILURE'
};
/**
 * StatusModel Class
 */

exports.STATUS_TYPES = STATUS_TYPES;

var StatusModel = /*#__PURE__*/function (_Model) {
  _inherits(StatusModel, _Model);

  var _super = _createSuper(StatusModel);

  /**
   * StatusModel constructor
   * @param service
   * @param status
   */
  function StatusModel(service, status) {
    var _this;

    _classCallCheck(this, StatusModel);

    _this = _super.call(this);

    _this.setService(service);

    _this.setStatus(status);

    return _this;
  }
  /**
   * Get Service
   * @return {*}
   */


  _createClass(StatusModel, [{
    key: "getService",
    value: function getService() {
      return this.service;
    }
    /**
     * Set Service
     * @param service
     */

  }, {
    key: "setService",
    value: function setService(service) {
      this.service = service;
    }
    /**
     * Set the status
     * @param status
     */

  }, {
    key: "setStatus",
    value: function setStatus(status) {
      if (typeof STATUS_TYPES[status] === 'undefined') {
        throw new Error("".concat(StatusModel.name, " - ").concat(status, " is not a valid status type"));
      }

      this.status = status;
    }
    /**
     * Get status
     * @return {string|*}
     */

  }, {
    key: "getStatus",
    value: function getStatus() {
      return this.status;
    }
  }]);

  return StatusModel;
}(_Model2["default"]);

exports["default"] = StatusModel;