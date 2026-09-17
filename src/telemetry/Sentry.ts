import * as Sentry from '@sentry/node';

import LoggerService from '../services/LoggerService';
import TelemetryProvider from './base';

/* eslint-disable class-methods-use-this */

/**
 * [Sentry](https://sentry.io/) telemetry provider.
 */
export default class SentryTelemetry extends TelemetryProvider {
  static get isEnabled(): boolean {
    return (
      typeof process.env.RAVEN_DSN !== 'undefined'
      && typeof process.env.RAVEN_DSN === 'string'
      && process.env.RAVEN_DSN !== 'undefined'
    );
  }

  static get sentry(): typeof Sentry {
    return Sentry;
  }

  constructor(logger: LoggerService) {
    super(logger);

    const { event, context } = logger.di;

    Sentry.configureScope((scope) => {
      scope.setTags({
        Event: event,
        Context: context as any,
      });
      scope.setExtras({
        lambda: context.functionName,
        memory_size: context.memoryLimitInMB,
        log_group: context.logGroupName,
        log_stream: context.logStreamName,
        stage: process.env.STAGE,
        path: event.path,
        httpMethod: event.httpMethod,
      });
    });
  }

  error(error: Error): void {
    Sentry.captureException(error);
  }

  label(_label: string): void {
    // not implemented
  }

  tag(_key: string, _value: any): void {
    // not implemented
  }
}

if (SentryTelemetry.isEnabled) {
  Sentry.init({
    dsn: process.env.RAVEN_DSN,
    shutdownTimeout: 5,
    environment: process.env.STAGE,
  });
}
