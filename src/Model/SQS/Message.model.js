import Model from '../Model.model';

/**
 * Message Model
 */
export default class Message extends Model {
  /**
   * Message constructor
   * @param message
   */
  constructor(message) {
    super();

    this.messageId = message.MessageId;
    this.receiptHandle = message.ReceiptHandle;

    this.body = JSON.parse(message.Body);
    this.forDeletion = false;
    this.metadata = {};
  }

  /**
   * Get Message ID
   * @returns {*}
   */
  getMessageId() {
    return this.messageId;
  }

  /**
   * Get Receipt Handle
   * @returns {*}
   */
  getReceiptHandle() {
    return this.receiptHandle;
  }

  /**
   * Get Body
   * @returns {any | *}
   */
  getBody() {
    return this.body;
  }

  /**
   * Set for deletion status
   * @param forDeletion
   */
  setForDeletion(forDeletion: boolean) {
    this.forDeletion = forDeletion;
  }

  /**
   * Whether message is for deletion
   * @returns {boolean|*}
   */
  isForDeletion() {
    return this.forDeletion;
  }

  /**
   * Get all of the message metadata
   * @returns {{}}
   */
  getMetaData() {
    return this.metadata;
  }

  /**
   * Set message metadata value
   * @param key
   * @param value
   */
  setMetaData(key, value) {
    this.metadata[key] = value;

    return this;
  }
}
