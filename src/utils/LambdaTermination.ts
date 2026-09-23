/**
 * An error that triggers a Lambda termination.
 *
 * Offers developer details (that are logged), a code for the Lambda and a
 * front-facing consumer message.
 */
export default class LambdaTermination extends Error {
  constructor(
    readonly internal: object | string,
    readonly code = 500,
    readonly body: object | string | null = null,
    readonly details = 'unknown error',
  ) {
    const stringified = typeof internal === 'string'
      ? internal
      : JSON.stringify(internal);

    super(stringified);

    this.body = body || 'unknown error';
  }
}
