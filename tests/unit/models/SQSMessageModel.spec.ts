import type { Message } from '@aws-sdk/client-sqs';

import { SQSMessageModel } from '@/src';

describe('unit.models.SQSMessageModel', () => {
  const messageData = {
    test: 123,
  };

  const mockedMessage = {
    MessageId: 'message-id-123',
    ReceiptHandle: 'receipt-handle-123',
    Body: JSON.stringify(messageData),
  };

  const messageModel = new SQSMessageModel(mockedMessage);

  describe('constructor', () => {
    it('should throw if message is missing MessageId', () => {
      const message: Message = { ...mockedMessage };
      delete message.MessageId;

      expect(() => new SQSMessageModel(message)).toThrowError(TypeError);
    });

    it('should throw if message is missing ReceiptHandle', () => {
      const message: Message = { ...mockedMessage };
      delete message.ReceiptHandle;

      expect(() => new SQSMessageModel(message)).toThrowError(TypeError);
    });

    it('should throw if message is missing Body', () => {
      const message: Message = { ...mockedMessage };
      delete message.Body;

      expect(() => new SQSMessageModel(message)).toThrowError(TypeError);
    });

    it('should throw if message body is not valid JSON', () => {
      const message: Message = {
        ...mockedMessage,
        Body: 'This is not JSON!',
      };

      expect(() => new SQSMessageModel(message)).toThrowError(TypeError);
    });
  });

  describe('getMessageId', () => {
    it('should return the message ID', () => {
      expect(messageModel.getMessageId()).toEqual(mockedMessage.MessageId);
    });
  });

  describe('getReceiptHandle', () => {
    it('should return the receipt handle', () => {
      expect(messageModel.getReceiptHandle()).toEqual(mockedMessage.ReceiptHandle);
    });
  });

  describe('getBody', () => {
    it('should parse and return the message body', () => {
      expect(messageModel.getBody()).toEqual(messageData);
    });
  });

  describe('isForDeletion', () => {
    it('should be false initially', () => {
      expect(messageModel.isForDeletion()).toBe(false);
    });
  });

  describe('setForDeletion', () => {
    it('should set the is-for-deletion status', () => {
      messageModel.setForDeletion(true);
      expect(messageModel.isForDeletion()).toBe(true);
    });
  });

  describe('getMetaData', () => {
    it('should return an empty object initially', () => {
      expect(messageModel.getMetaData()).toEqual({});
    });
  });

  describe('setMetaData', () => {
    it('should add a key to metadata', () => {
      messageModel.setMetaData('test', 123);
      expect(messageModel.getMetaData()).toEqual({ test: 123 });
    });
  });
});
