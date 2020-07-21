"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _alai = _interopRequireDefault(require("alai"));

var _awsSdk = _interopRequireDefault(require("aws-sdk"));

var _each = _interopRequireDefault(require("async/each"));

var _uuid = require("uuid");

var _DependencyAware = _interopRequireDefault(require("../DependencyInjection/DependencyAware.class"));

var _DependencyInjection = _interopRequireDefault(require("../DependencyInjection/DependencyInjection.class"));

var _Status = _interopRequireWildcard(require("../Model/Status.model"));

var _Message = _interopRequireDefault(require("../Model/SQS/Message.model"));

var _Dependencies = require("../Config/Dependencies");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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

// Set a timeout on S3 in case of outage
_awsSdk["default"].Config.httpOptions = {
  connectTimeout: 25000,
  timeout: 25000
};
var sqs = new _awsSdk["default"].SQS({
  region: process.env.REGION
});
/**
 * SQSService class
 */

var SQSService = /*#__PURE__*/function (_DependencyAwareClass) {
  _inherits(SQSService, _DependencyAwareClass);

  var _super = _createSuper(SQSService);

  /**
   * SQSService constructor
   * @param di DependencyInjection
   */
  function SQSService(di) {
    var _this;

    _classCallCheck(this, SQSService);

    _this = _super.call(this, di);

    var context = _this.getContainer().getContext();

    var queues = _this.getContainer().getConfiguration('QUEUES');

    var isOffline = !Object.prototype.hasOwnProperty.call(context, 'invokedFunctionArn') || context.invokedFunctionArn.indexOf('offline') !== -1;
    _this.queues = {}; // Add the queues from configuration

    if (queues !== null && Object.keys(queues).length >= 1) {
      Object.keys(queues).forEach(function (queueDefinition) {
        if (isOffline === true) {
          var offlineHost = typeof process.env.LAMBDA_WRAPPER_OFFLINE_SQS_HOST !== 'undefined' ? process.env.LAMBDA_WRAPPER_OFFLINE_SQS_HOST : 'localhost';
          _this.queues[queueDefinition] = "http://".concat(offlineHost, ":4576/queue/").concat(queues[queueDefinition]);
        } else {
          _this.queues[queueDefinition] = "https://sqs.".concat(process.env.REGION, ".amazonaws.com/").concat(_alai["default"].parse(context), "/").concat(queues[queueDefinition]);
        }
      });
    }

    return _this;
  }
  /**
   * Batch delete messages
   * @param queue strung
   * @param messageModels [SQSMessageModel]
   * @return {Promise<any>}
   */


  _createClass(SQSService, [{
    key: "batchDelete",
    value: function batchDelete(queue, messageModels) {
      var queueUrl = this.queues[queue];
      var Logger = this.getContainer().get(_Dependencies.DEFINITIONS.LOGGER);
      var Timer = this.getContainer().get(_Dependencies.DEFINITIONS.TIMER);
      var timerId = "sqs-batch-delete-".concat((0, _uuid.v4)());
      return new Promise(function (resolve) {
        var messagesForDeletion = [];
        Timer.start(timerId); // assuming openFiles is an array of file names

        (0, _each["default"])(messageModels, function (messageModel, callback) {
          if (messageModel instanceof _Message["default"] && messageModel.isForDeletion() === true) {
            messagesForDeletion.push({
              Id: messageModel.getMessageId(),
              ReceiptHandle: messageModel.getReceiptHandle()
            });
          }

          callback();
        }, function (loopErr) {
          if (loopErr) {
            Logger.error(loopErr);
            resolve();
          }

          sqs.deleteMessageBatch({
            Entries: messagesForDeletion,
            QueueUrl: queueUrl
          }, function (err) {
            Timer.stop(timerId);

            if (err) {
              Logger.error(err);
            }

            resolve();
          });
        });
      });
    }
    /**
     * Check SQS status
     * @return {Promise<any>}
     */

  }, {
    key: "checkStatus",
    value: function checkStatus() {
      var Logger = this.getContainer().get(_Dependencies.DEFINITIONS.LOGGER);
      var Timer = this.getContainer().get(_Dependencies.DEFINITIONS.TIMER);
      var timerId = "sqs-list-queues-".concat((0, _uuid.v4)());
      return new Promise(function (resolve) {
        Timer.start(timerId);
        sqs.listQueues({}, function (err, data) {
          Timer.stop(timerId);
          var statusModel = new _Status["default"]('SQS', _Status.STATUS_TYPES.OK);

          if (err) {
            Logger.error(err);
            statusModel.setStatus(_Status.STATUS_TYPES.APPLICATION_FAILURE);
          }

          if (typeof data.QueueUrls === 'undefined' || data.QueueUrls.length === 0) {
            statusModel.setStatus(_Status.STATUS_TYPES.APPLICATION_FAILURE);
          }

          resolve(statusModel);
        });
      });
    }
    /**
     * Get number of messages in a queue
     * @param queue
     * @return {Promise<any>}
     */

  }, {
    key: "getMessageCount",
    value: function getMessageCount(queue) {
      var queueUrl = this.queues[queue];
      var Logger = this.getContainer().get(_Dependencies.DEFINITIONS.LOGGER);
      var Timer = this.getContainer().get(_Dependencies.DEFINITIONS.TIMER);
      var timerId = "sqs-get-queue-attributes-".concat((0, _uuid.v4)());
      return new Promise(function (resolve) {
        Timer.start(timerId);
        sqs.getQueueAttributes({
          AttributeNames: ['ApproximateNumberOfMessages'],
          QueueUrl: queueUrl
        }, function (err, data) {
          Timer.stop(timerId);

          if (err) {
            Logger.error(err);
            resolve(0);
          }

          resolve(parseInt(data.Attributes.ApproximateNumberOfMessages, 10));
        });
      });
    }
    /**
     * Publish to message queue
     * @param queue          string
     * @param messageObject  object
     * @param messageGroupId string
     * @return {Promise<any>}
     */

  }, {
    key: "publish",
    value: function publish(queue, messageObject) {
      var messageGroupId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var queueUrl = this.queues[queue];
      var Logger = this.getContainer().get(_Dependencies.DEFINITIONS.LOGGER);
      var Timer = this.getContainer().get(_Dependencies.DEFINITIONS.TIMER);
      var timerId = "sqs-send-message-".concat((0, _uuid.v4)());
      return new Promise(function (resolve) {
        Timer.start(timerId);
        var messageParams = {
          MessageBody: JSON.stringify(messageObject),
          QueueUrl: queueUrl
        };

        if (queueUrl.includes('.fifo') === true) {
          messageParams.MessageDeduplicationId = (0, _uuid.v4)();
          messageParams.MessageGroupId = messageGroupId !== null ? messageGroupId : (0, _uuid.v4)();
        }

        sqs.sendMessage(messageParams, function (err) {
          Timer.stop(timerId);

          if (err) {
            Logger.error(err);
          }

          resolve({
            queue: queue
          });
        });
      });
    }
    /**
     * Receive from message queue
     * @param queue string
     * @param timeout number
     * @return {Promise<any>}
     */

  }, {
    key: "receive",
    value: function receive(queue) {
      var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 15;
      var queueUrl = this.queues[queue];
      var Logger = this.getContainer().get(_Dependencies.DEFINITIONS.LOGGER);
      var Timer = this.getContainer().get(_Dependencies.DEFINITIONS.TIMER);
      var timerId = "sqs-receive-message-".concat((0, _uuid.v4)());
      return new Promise(function (resolve, reject) {
        Timer.start(timerId);
        sqs.receiveMessage({
          QueueUrl: queueUrl,
          VisibilityTimeout: timeout,
          MaxNumberOfMessages: 10
        }, function (err, data) {
          Timer.stop(timerId);

          if (err) {
            Logger.error(err);
            return reject(err);
          }

          if (typeof data.Messages === 'undefined') {
            return resolve([]);
          }

          return resolve(data.Messages.map(function (message) {
            return new _Message["default"](message);
          }));
        });
      });
    }
  }]);

  return SQSService;
}(_DependencyAware["default"]);

exports["default"] = SQSService;