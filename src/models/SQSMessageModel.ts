import { SQS } from 'aws-sdk';

/**
 * Model for message received from SQS.
 *
 * This model is used to return messages from `SQSService#receive`, and
 * provides access to the message body (parsed from JSON) and everything needed
 * for deletion (message ID and receipt handle).
 *
 * Once you've successfully processed a message, flag it for deletion using
 * `setForDeletion(true)`. You can then batch-delete messages using
 * `SQSService#batchDelete`. This will _not_ delete messages that have
 * not had the `forDeletion` flag set, allowing them to remain in the queue and
 * be processed again at a later time.
 */
export default class Message {
  messageId: string;

  receiptHandle: string;

  body: string;

  forDeletion = false;

  metadata: Record<string, any> = {};

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
