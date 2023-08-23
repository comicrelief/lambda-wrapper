/**
 *
 */
export default class LambdaTermination extends Error {
  /**
   * Triggers a Lambda Termination.
   * Offers developer details (that are logged)
   * an code for the Lambda and a front facing
   * consumer message.
   *
   * @param {object|string} internal
   * @param {number?} code
   * @param {object|string?} body
   * @param details
   */
  constructor(internal, code = 500, body = null, details = 'unknown error') {
    let stringified = internal;

    if (typeof internal !== 'string') {
      stringified = JSON.stringify(internal);
    }
    super(stringified);

    this.internal = internal;
    this.code = code;
    this.body = body || 'unknown error';
    this.details = details;
  }
}
