import Winston from 'winston';
import * as Sentry from '@sentry/node';
import Epsagon from 'epsagon';

import DependencyAwareClass from '../DependencyInjection/DependencyAware.class';
import DependencyInjection from '../DependencyInjection/DependencyInjection.class';

const logger = Winston.createLogger({
  level: 'info',
  format: Winston.format.combine(
    Winston.format.json({
      replacer: (key, value) => {
        if (value instanceof Buffer) {
          return value.toString('base64');
        } else if (value instanceof Error) {
          const error = {};

          Object.getOwnPropertyNames(value).forEach(((objectKey) => {
            error[objectKey] = value[objectKey];
          }));

          return error;
        }

        return value;
      },
    }),
  ),
  transports: [
    new Winston.transports.Console(),
  ],
});

// Instantiate the sentry client
const sentryIsAvailable = typeof process.env.RAVEN_DSN !== 'undefined' && (typeof process.env.RAVEN_DSN === 'string' && process.env.RAVEN_DSN !== 'undefined');

if (sentryIsAvailable) {
  Sentry.init({
    dsn: process.env.RAVEN_DSN,
    shutdownTimeout: 5,
    environment: process.env.STAGE,
  });
}

/**
 * LoggerService class
 */
export default class LoggerService extends DependencyAwareClass {
  constructor(di: DependencyInjection) {
    super(di);
    this.sentry = null;
    const container = this.getContainer();
    const event = container.getEvent();
    const context = container.getContext();
    const isOffline = !Object.prototype.hasOwnProperty.call(context, 'invokedFunctionArn') || context.invokedFunctionArn.indexOf('offline') !== -1;

    // Set sentry client context
    if (sentryIsAvailable && isOffline === false) {
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
   * Log Error Message
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

    logger.log('error', message, { error });
    this.label('error', true);
    this.metric('error', 'error', true);
  }

  /**
   * Get sentry client
   * @return {null|*}
   */
  getSentry() {
    return this.sentry;
  }

  /**
   * Log Information Message
   * @param message string
   */
  info(message) {
    logger.log('info', message);
  }

  /**
   * Add a label
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
      logger.log('info', `label - ${descriptor}`);
    }
  }

  /**
   * Add a metric
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
      logger.log('info', `metric - ${descriptor} - ${stat}`);
    }
  }
}
