import * as Sentry from '@sentry/node';
import { AxiosError } from 'axios';
import Winston from 'winston';

import DependencyAwareClass from '../core/DependencyAwareClass';
import DependencyInjection from '../core/DependencyInjection';
import LumigoTelemetry from '../telemetry/Lumigo';
import SentryTelemetry from '../telemetry/Sentry';
import TelemetryProvider from '../telemetry/base';

/**
 * List of all supported telemetry providers.
 *
 * Providers that are enabled (according to their `isEnabled` property) will be
 * instantiated by the logger.
 */
const TELEMETRY_PROVIDERS = [
  SentryTelemetry,
  LumigoTelemetry,
];

/**
 * Provides logging and integrations with our monitoring tools.
 *
 * For logging we use [Winston](https://github.com/winstonjs/winston).
 * Errors, labels, and metrics will also be sent to telemetry providers, if
 * configured. We currently support:
 *
 * - [Sentry](https://sentry.io/)
 * - [Lumigo](https://lumigo.io/)
 */
export default class LoggerService extends DependencyAwareClass {
  private telemetryProviders: TelemetryProvider[] = [];

  private winston: Winston.Logger | null;

  constructor(di: DependencyInjection) {
    super(di);

    this.winston = null;

    TELEMETRY_PROVIDERS.forEach((Provider) => {
      if (Provider.isEnabled) {
        this.telemetryProviders.push(new Provider(this));
      }
    });
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
   *
   * Returns `null` if Sentry is disabled, either because it's not configured
   * or the service is running in an offline context.
   *
   * @deprecated This method will be removed in a future major release. If you
   * need access to the Sentry client, install and import `@sentry/node`.
   */
  // eslint-disable-next-line class-methods-use-this
  getSentry() {
    return SentryTelemetry.isEnabled && !this.di.isOffline ? Sentry : null;
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
   * Log an error and report to telemetry platforms.
   *
   * @param error object
   * @param message string
   */
  error(error: any, message = '') {
    if (error instanceof Error) {
      this.telemetryProviders.forEach((provider) => provider.error(error, message));
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
   * Add a label to the function's logs and telemetry.
   *
   * @param descriptor
   * @param silent If `false`, the label will also be logged. (default: false)
   */
  label(descriptor: string, silent = false) {
    this.telemetryProviders.forEach((provider) => provider.label(descriptor));

    if (!silent) {
      this.logger.log('info', `label - ${descriptor}`);
    }
  }

  /**
   * Add a metric to the function's logs and telemetry.
   *
   * @param descriptor
   * @param stat
   * @param silent If `false`, the metric will also be logged. (default: false)
   */
  metric(descriptor: string, stat: number | string, silent = false) {
    this.telemetryProviders.forEach((provider) => provider.tag(descriptor, stat));

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
