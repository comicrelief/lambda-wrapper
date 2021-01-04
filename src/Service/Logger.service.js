import Winston from 'winston';
import * as Sentry from '@sentry/node';
import Epsagon from 'epsagon';

import DependencyAwareClass from '../DependencyInjection/DependencyAware.class';
import DependencyInjection from '../DependencyInjection/DependencyInjection.class';

// Instantiate the sentry client
const sentryIsAvailable = typeof process.env.RAVEN_DSN !== 'undefined' && typeof process.env.RAVEN_DSN === 'string' && process.env.RAVEN_DSN !== 'undefined';

if (sentryIsAvailable) {
  Sentry.init({
    dsn: process.env.RAVEN_DSN,
    shutdownTimeout: 5,
    environment: process.env.STAGE,
  });
}

export const LOGGING_LEVELS = {
  dev: 'info',
  staging: 'info',
  production: 'error',
};

/**
 * LoggerService class
 */
export default class LoggerService extends DependencyAwareClass {
  constructor(di: DependencyInjection) {
    super(di);
    this.sentry = null;
    this.winston = null;

    const container = this.getContainer();
    const event = container.getEvent();
    const context = container.getContext();

    // Set sentry client context
    if (sentryIsAvailable && !container.isOffline) {
      Sentry.configureScope((scope) => {
        scope.setTags({
          Event: event,
          Context: context,
        });
        scope.setExtras({
          lambda: context.functionName,
          memory_size: context.memoryLimitInMB,
          log_group: context.log_group_name,
          log_stream: context.log_stream_name,
          stage: process.env.STAGE,
          path: event.path,
          httpMethod: event.httpMethod,
        });
      });

      this.sentry = Sentry;
    }
  }

  /**
   * Returns a Winston logger object
   * configured for our lambdas.
   *
   * Note:
   *
   * If the lambda is executed
   * in a `serverless-offline` context
   * the log output to console will be pretty printed.
   */
  getLogger() {
    const loggerFormats = [
      Winston.format.json({
        replacer: (key, value) => {
          if (value instanceof Buffer) {
            return value.toString('base64');
          }
          if (value instanceof Error) {
            const error = {};

            Object.getOwnPropertyNames(value).forEach((objectKey) => {
              error[objectKey] = value[objectKey];
            });

            return error;
          }

          return value;
        },
      }),
    ];

    if (this.getContainer().isOffline) {
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
   * Uses a cached `Winston` object
   * if it has been already generated,
   * otherwise it generates one.
   */
  get logger() {
    if (!this.winston) {
      this.winston = this.getLogger();
    }

    return this.winston;
  }

  /**
   * While handling an error, lambda wrapper should
   * recognise axios errors and trim down the information.
   *
   * Keep the following keys:
   * - message.config
   * - message.message
   * - message.response?.status
   * - message.response?.data
   *
   * @param {object} error
   */
  static processAxiosError(error) {
    const processed = {
      config: error.config,
      message: error.message,
    };

    // It's pretty common for axios errors
    // to not have.response e.g.when there's
    // a network error or timeout.
    // These errors will have .request but not .response.
    if (error.response) {
      processed.response = {
        status: error.response.status,
        data: error.response.data,
      };
    }

    return processed;
  }

  /**
   * Transform the original message
   * before it is passed to the winston logger
   *
   * @param {string|object} message
   */
  processMessage(message = '') {
    let processed = message;

    if (processed && processed.isAxiosError) {
      processed = this.constructor.processAxiosError(processed);
    }

    return processed;
  }

  /**
   * Log Error Message
   *
   * @param error object
   * @param message string
   */
  error(error, message = '') {
    if (sentryIsAvailable && error instanceof Error) {
      Sentry.captureException(error);
    }

    if (
      typeof process.env.EPSAGON_TOKEN === 'string'
      && process.env.EPSAGON_TOKEN !== 'undefined'
      && typeof process.env.EPSAGON_SERVICE_NAME === 'string'
      && process.env.EPSAGON_SERVICE_NAME !== 'undefined'
      && error instanceof Error
    ) {
      Epsagon.setError(error);
    }

    this.logger.log('error', message, { error: this.processMessage(error) });
    this.label('error', true);
    this.metric('error', 'error', true);
  }

  /**
   * Get sentry client
   *
   * @returns {null|*}
   */
  getSentry() {
    return this.sentry;
  }

  /**
   * Log Information Message
   *
   * @param message string
   */
  info(message) {
    this.logger.log('info', this.processMessage(message));
  }

  /**
   * Logs an error, using logger.error
   * or logger.info based on the logging levels
   * that are based on the process.env.DEPLOY_ENV
   *
   * @param error
   * @param message
   */
  warning(error, message = '') {
    const loggerFunction = LOGGING_LEVELS[process.env.DEPLOY_ENV] || 'error';

    return this[loggerFunction](error, message);
  }

  /**
   * Add a label
   *
   * @param descriptor string
   * @param silent     boolean
   */
  label(descriptor, silent = false) {
    if (
      typeof process.env.EPSAGON_TOKEN === 'string'
      && process.env.EPSAGON_TOKEN !== 'undefined'
      && typeof process.env.EPSAGON_SERVICE_NAME === 'string'
      && process.env.EPSAGON_SERVICE_NAME !== 'undefined'
    ) {
      Epsagon.label(descriptor);
    }

    if (silent === false) {
      this.logger.log('info', `label - ${descriptor}`);
    }
  }

  /**
   * Add a metric
   *
   * @param descriptor string
   * @param stat       integer | string
   * @param silent     boolean
   */
  metric(descriptor, stat, silent = false) {
    if (
      typeof process.env.EPSAGON_TOKEN === 'string'
      && process.env.EPSAGON_TOKEN !== 'undefined'
      && typeof process.env.EPSAGON_SERVICE_NAME === 'string'
      && process.env.EPSAGON_SERVICE_NAME !== 'undefined'
    ) {
      Epsagon.label(descriptor, stat);
    }

    if (silent === false) {
      this.logger.log('info', `metric - ${descriptor} - ${stat}`);
    }
  }
}
