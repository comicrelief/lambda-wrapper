import { SQS } from 'aws-sdk';

/**
 * Message model for SQS.
 */
export default class Message {
  readonly messageId: string;

  readonly receiptHandle: string;

  readonly body: unknown;

  readonly metadata: Record<string, any> = {};

  forDeletion = false;

  constructor(message: SQS.Message) {
    // todo: validate rather than assert the type
    this.messageId = message.MessageId!;
    this.receiptHandle = message.ReceiptHandle!;
    this.body = JSON.parse(message.Body!);
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
