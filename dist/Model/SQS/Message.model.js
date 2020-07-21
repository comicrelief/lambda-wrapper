"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _Model2 = _interopRequireDefault(require("../Model.model"));

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

var Message = /*#__PURE__*/function (_Model) {
  _inherits(Message, _Model);

  var _super = _createSuper(Message);

  /**
   * Message constructor
   * @param message
   */
  function Message(message) {
    var _this;

    _classCallCheck(this, Message);

    _this = _super.call(this);
    _this.messageId = message.MessageId;
    _this.receiptHandle = message.ReceiptHandle;
    _this.body = JSON.parse(message.Body);
    _this.forDeletion = false;
    _this.metadata = {};
    return _this;
  }
  /**
   * Get Message ID
   * @return {*}
   */


  _createClass(Message, [{
    key: "getMessageId",
    value: function getMessageId() {
      return this.messageId;
    }
    /**
     * Get Receipt Handle
     * @return {*}
     */

  }, {
    key: "getReceiptHandle",
    value: function getReceiptHandle() {
      return this.receiptHandle;
    }
    /**
     * Get Body
     * @return {any | *}
     */

  }, {
    key: "getBody",
    value: function getBody() {
      return this.body;
    }
    /**
     * Set for deletion status
     * @param forDeletion
     */

  }, {
    key: "setForDeletion",
    value: function setForDeletion(forDeletion) {
      this.forDeletion = forDeletion;
    }
    /**
     * Whether message is for deletion
     * @return {boolean|*}
     */

  }, {
    key: "isForDeletion",
    value: function isForDeletion() {
      return this.forDeletion;
    }
    /**
     * Get all of the message metadata
     * @return {{}}
     */

  }, {
    key: "getMetaData",
    value: function getMetaData() {
      return this.metadata;
    }
    /**
     * Set message metadata value
     * @param key
     * @param value
     */

  }, {
    key: "setMetaData",
    value: function setMetaData(key, value) {
      this.metadata[key] = value;
      return this;
    }
  }]);

  return Message;
}(_Model2["default"]);

exports["default"] = Message;