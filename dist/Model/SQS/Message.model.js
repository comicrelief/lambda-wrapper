'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Model2 = require('../Model.model');

var _Model3 = _interopRequireDefault(_Model2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Message = function (_Model) {
  _inherits(Message, _Model);

  /**
   * Message constructor
   * @param message
   */
  function Message(message) {
    _classCallCheck(this, Message);

    var _this = _possibleConstructorReturn(this, (Message.__proto__ || Object.getPrototypeOf(Message)).call(this));

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
    key: 'getMessageId',
    value: function getMessageId() {
      return this.messageId;
    }

    /**
     * Get Receipt Handle
     * @return {*}
     */

  }, {
    key: 'getReceiptHandle',
    value: function getReceiptHandle() {
      return this.receiptHandle;
    }

    /**
     * Get Body
     * @return {any | *}
     */

  }, {
    key: 'getBody',
    value: function getBody() {
      return this.body;
    }

    /**
     * Set for deletion status
     * @param forDeletion
     */

  }, {
    key: 'setForDeletion',
    value: function setForDeletion(forDeletion) {
      this.forDeletion = forDeletion;
    }

    /**
     * Whether message is for deletion
     * @return {boolean|*}
     */

  }, {
    key: 'isForDeletion',
    value: function isForDeletion() {
      return this.forDeletion;
    }

    /**
     * Get all of the message metadata
     * @return {{}}
     */

  }, {
    key: 'getMetaData',
    value: function getMetaData() {
      return this.metadata;
    }

    /**
     * Set message metadata value
     * @param key
     * @param value
     */

  }, {
    key: 'setMetaData',
    value: function setMetaData(key, value) {
      this.metadata[key] = value;

      return this;
    }
  }]);

  return Message;
}(_Model3.default);

exports.default = Message;