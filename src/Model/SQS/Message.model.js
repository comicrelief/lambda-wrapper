import Model from '../Model.model';

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
  }

  /**
   * Get Message ID
   * @return {*}
   */
  getMessageId() {
    return this.messageId;
  }

  /**
   * Get Receipt Handle
   * @return {*}
   */
  getReceiptHandle() {
    return this.receiptHandle;
  }

  /**
   * Get Body
   * @return {any | *}
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
   * @return {boolean|*}
   */
  isForDeletion() {
    return this.forDeletion;
  }
}
