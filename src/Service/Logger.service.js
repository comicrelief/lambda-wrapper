import Winston from 'winston';

import DependencyAwareClass from '../DependencyInjection/DependencyAware.class';
import DependencyInjection from '../DependencyInjection/DependencyInjection.class';

const Sentry = require('@sentry/node');

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

// Instantiate the raven client
const ravenIsAvailable = typeof process.env.RAVEN_DSN !== 'undefined' && (typeof process.env.RAVEN_DSN === 'string' && process.env.RAVEN_DSN !== 'undefined');

if (ravenIsAvailable) {
  Sentry.init({
    dsn: process.env.RAVEN_DSN,
    environment: process.env.STAGE,
  });
}

/**
 * LoggerService class
 */
export default class LoggerService extends DependencyAwareClass {
  constructor(di: DependencyInjection) {
    super(di);
    this.raven = null;
    const container = this.getContainer();
    const event = container.getEvent();
    const context = container.getContext();
    const isOffline = !Object.prototype.hasOwnProperty.call(context, 'invokedFunctionArn') || context.invokedFunctionArn.indexOf('offline') !== -1;

    // Set raven client context
    if (ravenIsAvailable && isOffline === false) {
      Sentry.configureScope((scope) => {
        scope.setExtra('Event', event);
        scope.setExtra('Context', context);
        scope.setTag('lambda', context.functionName);
        scope.setTag('memory_size', context.memoryLimitInMB);
        scope.setTag('log_group', context.logGroupName);
        scope.setTag('log_stream', context.logStreamName);
        scope.setTag('stage', process.env.STAGE);
        scope.setTag('path', event.path);
        scope.setTag('httpMethod', event.httpMethod);
      });
      this.raven = Sentry;
    }
  }

  /**
   * Log Error Message
   * @param error object
   * @param message string
   */
  error(error, message = '') {
    if (ravenIsAvailable && error instanceof Error) {
      Sentry.captureException(error);
    }

    logger.log('error', message, { error });
    this.label('error', true);
    this.metric('error', 'error', true);
  }

  /**
   * Get raven client
   * @return {null|*}
   */
  getRaven() {
    return this.raven;
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
    if (typeof process.env.IOPIPE_TOKEN === 'string' && process.env.IOPIPE_TOKEN !== 'undefined') {
      this.getContainer().getContext().iopipe.label(descriptor);
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
    if (typeof process.env.IOPIPE_TOKEN === 'string' && process.env.IOPIPE_TOKEN !== 'undefined') {
      this.getContainer().getContext().iopipe.metric(descriptor, stat);
    }

    if (silent === false) {
      logger.log('info', `metric - ${descriptor} - ${stat}`);
    }
  }
}
