import * as lumigo from '@lumigo/tracer';
import * as Sentry from '@sentry/node';
import { AxiosError } from 'axios';
import Winston from 'winston';

import DependencyAwareClass from '../core/DependencyAwareClass';
import DependencyInjection from '../core/DependencyInjection';

const sentryIsAvailable = typeof process.env.RAVEN_DSN !== 'undefined' && typeof process.env.RAVEN_DSN === 'string' && process.env.RAVEN_DSN !== 'undefined';

// initialise the Sentry client if available
if (sentryIsAvailable) {
  Sentry.init({
    dsn: process.env.RAVEN_DSN,
    shutdownTimeout: 5,
    environment: process.env.STAGE,
  });
}

/**
 * Provides logging and integrations with our monitoring tools.
 *
 * For logging we use [Winston](https://github.com/winstonjs/winston).
 * Errors will also be sent to [Sentry](https://sentry.io/) and
 * [Epsagon](https://epsagon.com/) if those are available.
 */
export default class LoggerService extends DependencyAwareClass {
  private sentry: typeof Sentry | null;

  private winston: Winston.Logger | null;

  constructor(di: DependencyInjection) {
    super(di);

    this.sentry = null;
    this.winston = null;

    const { event, context } = this.di;

    if (sentryIsAvailable && !di.isOffline) {
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

      this.sentry = Sentry;
    }
  }

  /**
   * Returns a Winston logger configured for our lambdas.
   *
   * Note: If the lambda is executed in a `serverless-offline` context, the
   * log output to console will be pretty-printed.
   */
  getLogger() {
    const loggerFormats = [
      Winston.format.json({
        replacer: (key, value) => {
          if (value instanceof Buffer) {
            return value.toString('base64');
          }
          if (value instanceof Error) {
            return Object.fromEntries(
              Object.getOwnPropertyNames(value)
                .map((errorKey) => [errorKey, (value as any)[errorKey]]),
            );
          }
          return value;
        },
      }),
    ];

    if (this.di.isOffline) {
      loggerFormats.push(Winston.format.prettyPrint());
    }

    return Winston.createLogger({
      level: 'info',
      format: Winston.format.combine(...loggerFormats),
      transports: [new Winston.transports.Console()],
    });
  }

  /**
   * Returns the logger.
   *
   * Uses a cached Winston logger if it has been already created, otherwise it
   * creates one.
   */
  get logger() {
    if (!this.winston) {
      this.winston = this.getLogger();
    }

    return this.winston;
  }

  /**
   * Get Sentry client.
   */
  getSentry() {
    return this.sentry;
  }

  /**
   * While logging an error, we should recognise axios errors and trim down the
   * information to only what is useful for debugging.
   *
   * Keep the following keys:
   * - message.config
   * - message.message
   * - message.response?.status
   * - message.response?.data
   *
   * @param {object} error
   */
  static processAxiosError(error: AxiosError) {
    const processed: any = {
      config: error.config,
      message: error.message,
    };

    // It's pretty common for axios errors to not have a `response`,
    // for example if there was a network error or timeout.
    if (error.response) {
      processed.response = {
        status: error.response.status,
        data: error.response.data,
      };
    }

    return processed;
  }

  /**
   * Transform the original message before it is passed to the logger.
   *
   * @param message
   */
  static processMessage(message: any) {
    let processed = message;

    if (processed?.isAxiosError) {
      processed = LoggerService.processAxiosError(processed);
    }

    return processed;
  }

  /**
   * Log Error Message
   *
   * @param error object
   * @param message string
   */
  error(error: any, message = '') {
    if (sentryIsAvailable && error instanceof Error) {
      Sentry.captureException(error);
    }

    if (process.env.LUMIGO_TOKEN && error instanceof Error) {
      // todo: find out what the equivalent is in Lumigo
      // Epsagon.setError(error);
    }

    this.logger.log('error', message, { error: LoggerService.processMessage(error) });
    this.label('error', true);
    this.metric('error', 'error', true);
  }

  /**
   * Log an informational message.
   *
   * @param message
   */
  info(message: any) {
    this.logger.log('info', LoggerService.processMessage(message));
  }

  /**
   * Log an error, using `LoggerService.error` or `LoggerService.info` based
   * on `process.env.LOGGER_SOFT_WARNING`.
   *
   * Please note that `LoggerService.error` and `LoggerService.info` have
   * different signatures. The function uses the shared argument instead of
   * introducing ambiguity.
   *
   * @param error
   */
  warning(error: any) {
    const softWarningValues = ['true', '1'];

    if (softWarningValues.includes(process.env.LOGGER_SOFT_WARNING || '')) {
      return this.info(error);
    }

    return this.error(error);
  }

  /**
   * Add a label to the function's Epsagon trace.
   *
   * @param descriptor
   * @param silent If `false`, the label will also be logged. (default: false)
   */
  label(descriptor: string, silent = false) {
    if (process.env.LUMIGO_TOKEN) {
      // todo: do we need to use our `tracer` instance here?
      lumigo.addExecutionTag(descriptor, true);
    }

    if (!silent) {
      this.logger.log('info', `label - ${descriptor}`);
    }
  }

  /**
   * Add a metric to the function's Epsagon trace.
   *
   * @param descriptor
   * @param stat
   * @param silent If `false`, the metric will also be logged. (default: false)
   */
  metric(descriptor: string, stat: number | string, silent = false) {
    if (process.env.LUMIGO_TOKEN) {
      // todo: do we need to use our `tracer` instance here?
      lumigo.addExecutionTag(descriptor, stat);
    }

    if (silent === false) {
      this.logger.log('info', `metric - ${descriptor} - ${stat}`);
    }
  }

  /**
   * Log an object so that it can be inspected.
   *
   * @param action What are we doing with the object, e.g. 'Processing'
   * @param object The object to be stored in logs
   * @param level 'error', 'warning' or 'info'
   */
  object(action: string, object: any, level: 'error' | 'warning' | 'info' = 'info') {
    if (!(['error', 'warning', 'info'].includes(level))) {
      throw new Error('Unrecognised log level');
    }

    const payload = JSON.stringify(object, null, 4);

    return this[level](`${action}: '${payload}'`);
  }
}
