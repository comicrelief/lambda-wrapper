import * as lumigo from '@lumigo/tracer';

import TelemetryProvider from './base';

/* eslint-disable class-methods-use-this */

/**
 * [Lumigo](https://lumigo.io/) telemetry provider, integrating with their
 * tracer.
 */
export default class LumigoTelemetry extends TelemetryProvider {
  /**
   * `true` if we can send traces to Lumigo.
   *
   * The `LUMIGO_TRACER_TOKEN` env var is present in both manually traced and
   * auto-traced functions.
   */
  static get isEnabled(): boolean {
    return !!process.env.LUMIGO_TRACER_TOKEN;
  }

  /**
   * `true` if the Lambda function is already being traced by a higher-level
   * Lumigo wrapper, in which case we don't need to manually wrap our handlers.
   *
   * There are two ways that this can be done, based on the documentation
   * [here](https://docs.lumigo.io/docs/lambda-layers): using a Lambda runtime
   * wrapper, or handler redirection. Each method can be detected via its
   * environment variables. Auto-trace uses the runtime wrapper.
   */
  static get isLumigoWrappingUs(): boolean {
    return this.isEnabled && (
      process.env.AWS_LAMBDA_EXEC_WRAPPER === '/opt/lumigo_wrapper'
      || !!process.env.LUMIGO_ORIGINAL_HANDLER
    );
  }

  error(error: Error, message?: string): void {
    lumigo.error(message || error.message, { err: error });
  }

  label(label: string): void {
    this.tag(label, true);
  }

  tag(key: string, value: any): void {
    lumigo.addExecutionTag(key, value);
  }
}
