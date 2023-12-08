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
