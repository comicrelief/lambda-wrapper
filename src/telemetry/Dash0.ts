import type { TraceAPI } from '@opentelemetry/api';

import LoggerService from '../services/LoggerService';
import TelemetryProvider from './base';

/**
 * [Dash0](https://www.dash0.com/) telemetry provider.
 *
 * This currently requires use of the Dash0 Lambda Extension Layer. Functions
 * instead instrumented with the OpenTelemetry Lambda stack are not supported.
 *
 * Use of Dash0 requires the `@opentelemetry/api` package to be added to your
 * project dependencies.
 */
export default class Dash0Telemetry extends TelemetryProvider {
  /**
   * `true` if we can send telemetry to Dash0.
   *
   * The `DASH0_*` env vars will be present in functions instrumented using the
   * Dash0 Lambda Extension Layer.
   *
   * Docs at https://www.dash0.com/hub/integrations/int_aws_lambda/overview
   */
  static get isEnabled(): boolean {
    return process.env.AWS_LAMBDA_EXEC_WRAPPER === '/opt/wrapper' && !!(
      process.env.DASH0_ENDPOINT
      && process.env.DASH0_TOKEN
      && process.env.DASH0_DATASET
    );
  }

  readonly trace: TraceAPI;

  constructor(logger: LoggerService) {
    super(logger);

    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    const opentelemetry = require('@opentelemetry/api');
    this.trace = opentelemetry.trace;
  }

  error(error: Error): void {
    this.trace.getActiveSpan()?.recordException(error);
  }

  label(label: string): void {
    this.tag(label, true);
  }

  tag(key: string, value: any): void {
    this.trace.getActiveSpan()?.setAttribute(key, value);
  }
}
