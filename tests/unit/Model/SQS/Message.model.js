import ServerlessMochaPlugin from 'serverless-mocha-plugin';
import Message from "../../../../src/Model/SQS/Message.model";

const expect = ServerlessMochaPlugin.chai.expect;

// Test definitions.
describe('Model/SQS/Message.model', () => {

  describe('Ensure setting and getting of variables', () => {

    const messageData = {
      test: 123,
    };

    const mockedMessage = {
      MessageId: 123,
      ReceiptHandle: 123,
      Body: JSON.stringify(messageData),
    };

    const messageModel = new Message(mockedMessage);

    it('should set and get the message id', () => {
      expect(messageModel.getMessageId()).to.eql(mockedMessage.MessageId);
    });

    it('should set and get the receipt handle', () => {
      expect(messageModel.getReceiptHandle()).to.eql(mockedMessage.ReceiptHandle);
    });

    it('should set, parse the JSON and get the body', () => {
      expect(messageModel.getBody()).to.eql(messageData);
    });

    it('should default to having a for deletion status of false', () => {
      expect(messageModel.isForDeletion()).to.be.false;
    });

    it('should be able to change the for deletion status to true', () => {
      messageModel.setForDeletion(true);
      expect(messageModel.isForDeletion()).to.be.true;
    });

    it('should be able to set metadata', () => {
      messageModel.setMetaData('test', 123);
      expect(messageModel.getMetaData()).to.eql({
        test: 123,
      });
    });

  });

});
