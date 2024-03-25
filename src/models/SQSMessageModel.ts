import type { Message } from '@aws-sdk/client-sqs';

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
export default class SQSMessageModel {
  readonly messageId: string;

  readonly receiptHandle: string;

  readonly body: unknown;

  readonly metadata: Record<string, any> = {};

  forDeletion = false;

  constructor(message: Message) {
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
  getMessageId(): string {
    return this.messageId;
  }

  /**
   * Get message receipt handle.
   */
  getReceiptHandle(): string {
    return this.receiptHandle;
  }

  /**
   * Get message body.
   */
  getBody(): unknown {
    return this.body;
  }

  /**
   * Set for deletion status.
   *
   * @param forDeletion
   */
  setForDeletion(forDeletion: boolean): void {
    this.forDeletion = forDeletion;
  }

  /**
   * Whether message is for deletion.
   */
  isForDeletion(): boolean {
    return this.forDeletion;
  }

  /**
   * Get all of the message metadata.
   */
  getMetaData(): Record<string, any> {
    return this.metadata;
  }

  /**
   * Set message metadata value
   *
   * @param key
   * @param value
   */
  setMetaData(key: string, value: any): this {
    this.metadata[key] = value;

    return this;
  }
}
