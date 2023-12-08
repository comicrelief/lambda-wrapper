import { SQS } from 'aws-sdk';

/**
 * Message model for SQS.
 */
export default class Message {
  messageId: string;

  receiptHandle: string;

  body: string;

  forDeletion = false;

  metadata: Record<string, any> = {};

  constructor(message: SQS.Message) {
    if (!message.MessageId) {
      throw new TypeError('Message does not have a MessageId');
    }
    if (!message.ReceiptHandle) {
      throw new TypeError('Message does not have a ReceiptHandle');
    }
    if (!message.Body) {
      throw new TypeError('Message does not have a Body');
    }

    this.messageId = message.MessageId;
    this.receiptHandle = message.ReceiptHandle;

    try {
      this.body = JSON.parse(message.Body);
    } catch (error) {
      throw new TypeError('Message body is not valid JSON');
    }
  }

  /**
   * Get message ID.
   */
  getMessageId() {
    return this.messageId;
  }

  /**
   * Get message receipt handle.
   */
  getReceiptHandle() {
    return this.receiptHandle;
  }

  /**
   * Get message body.
   */
  getBody() {
    return this.body;
  }

  /**
   * Set for deletion status.
   *
   * @param forDeletion
   */
  setForDeletion(forDeletion: boolean) {
    this.forDeletion = forDeletion;
  }

  /**
   * Whether message is for deletion.
   */
  isForDeletion() {
    return this.forDeletion;
  }

  /**
   * Get all of the message metadata.
   */
  getMetaData() {
    return this.metadata;
  }

  /**
   * Set message metadata value
   *
   * @param key
   * @param value
   */
  setMetaData(key: string, value: any) {
    this.metadata[key] = value;

    return this;
  }
}
