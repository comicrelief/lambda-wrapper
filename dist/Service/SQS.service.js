'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _alai = require('alai');

var _alai2 = _interopRequireDefault(_alai);

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _each = require('async/each');

var _each2 = _interopRequireDefault(_each);

var _v = require('uuid/v4');

var _v2 = _interopRequireDefault(_v);

var _DependencyAware = require('../DependencyInjection/DependencyAware.class');

var _DependencyAware2 = _interopRequireDefault(_DependencyAware);

var _DependencyInjection = require('../DependencyInjection/DependencyInjection.class');

var _DependencyInjection2 = _interopRequireDefault(_DependencyInjection);

var _Status = require('../Model/Status.model');

var _Status2 = _interopRequireDefault(_Status);

var _Message = require('../Model/SQS/Message.model');

var _Message2 = _interopRequireDefault(_Message);

var _Dependencies = require('../Config/Dependencies');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Set a timeout on S3 in case of outage
_awsSdk2.default.Config.httpOptions = {
  connectTimeout: 25000,
  timeout: 25000
};

var sqs = new _awsSdk2.default.SQS({
  region: process.env.REGION
});

/**
 * SQSService class
 */

var SQSService = function (_DependencyAwareClass) {
  _inherits(SQSService, _DependencyAwareClass);

  /**
   * SQSService constructor
   * @param di DependencyInjection
   */
  function SQSService(di) {
    _classCallCheck(this, SQSService);

    var _this = _possibleConstructorReturn(this, (SQSService.__proto__ || Object.getPrototypeOf(SQSService)).call(this, di));

    var context = _this.getContainer().getContext();
    var queues = _this.getContainer().getConfiguration('QUEUES');
    var isOffline = !Object.prototype.hasOwnProperty.call(context, 'invokedFunctionArn') || context.invokedFunctionArn.indexOf('offline') !== -1;

    _this.queues = {};

    // Add the queues from configuration
    if (queues !== null && Object.keys(queues).length >= 1) {
      Object.keys(queues).forEach(function (queueDefinition) {
        if (isOffline === true) {
          var offlineHost = typeof process.env.LAMBDA_WRAPPER_OFFLINE_SQS_HOST !== 'undefined' ? process.env.LAMBDA_WRAPPER_OFFLINE_SQS_HOST : 'localhost';

          _this.queues[queueDefinition] = 'http://' + offlineHost + ':4576/queue/' + queues[queueDefinition];
        } else {
          _this.queues[queueDefinition] = 'https://sqs.' + process.env.REGION + '.amazonaws.com/' + _alai2.default.parse(context) + '/' + queues[queueDefinition];
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
    key: 'batchDelete',
    value: function batchDelete(queue, messageModels) {
      var queueUrl = this.queues[queue];
      var Logger = this.getContainer().get(_Dependencies.DEFINITIONS.LOGGER);
      var Timer = this.getContainer().get(_Dependencies.DEFINITIONS.TIMER);
      var timerId = 'sqs-batch-delete-' + (0, _v2.default)();

      return new Promise(function (resolve) {
        var messagesForDeletion = [];

        Timer.start(timerId);
        // assuming openFiles is an array of file names
        (0, _each2.default)(messageModels, function (messageModel, callback) {
          if (messageModel instanceof _Message2.default && messageModel.isForDeletion() === true) {
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
    key: 'checkStatus',
    value: function checkStatus() {
      var Logger = this.getContainer().get(_Dependencies.DEFINITIONS.LOGGER);
      var Timer = this.getContainer().get(_Dependencies.DEFINITIONS.TIMER);
      var timerId = 'sqs-list-queues-' + (0, _v2.default)();

      return new Promise(function (resolve) {
        Timer.start(timerId);

        sqs.listQueues({}, function (err, data) {
          Timer.stop(timerId);

          var statusModel = new _Status2.default('SQS', _Status.STATUS_TYPES.OK);

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
    key: 'getMessageCount',
    value: function getMessageCount(queue) {
      var queueUrl = this.queues[queue];
      var Logger = this.getContainer().get(_Dependencies.DEFINITIONS.LOGGER);
      var Timer = this.getContainer().get(_Dependencies.DEFINITIONS.TIMER);
      var timerId = 'sqs-get-queue-attributes-' + (0, _v2.default)();

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
    key: 'publish',
    value: function publish(queue, messageObject) {
      var messageGroupId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      var queueUrl = this.queues[queue];
      var Logger = this.getContainer().get(_Dependencies.DEFINITIONS.LOGGER);
      var Timer = this.getContainer().get(_Dependencies.DEFINITIONS.TIMER);
      var timerId = 'sqs-send-message-' + (0, _v2.default)();

      return new Promise(function (resolve) {
        Timer.start(timerId);

        var messageParams = {
          MessageBody: JSON.stringify(messageObject),
          QueueUrl: queueUrl
        };

        if (queueUrl.includes('.fifo') === true) {
          messageParams.MessageDeduplicationId = (0, _v2.default)();
          messageParams.MessageGroupId = messageGroupId !== null ? messageGroupId : (0, _v2.default)();
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
    key: 'receive',
    value: function receive(queue) {
      var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 15;

      var queueUrl = this.queues[queue];
      var Logger = this.getContainer().get(_Dependencies.DEFINITIONS.LOGGER);
      var Timer = this.getContainer().get(_Dependencies.DEFINITIONS.TIMER);
      var timerId = 'sqs-receive-message-' + (0, _v2.default)();

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
            return new _Message2.default(message);
          }));
        });
      });
    }
  }]);

  return SQSService;
}(_DependencyAware2.default);

exports.default = SQSService;