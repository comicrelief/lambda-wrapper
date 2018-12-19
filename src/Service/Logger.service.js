import Winston from 'winston';
import Raven from 'raven';
import { label, metric } from '@iopipe/iopipe';

import DependencyAwareClass from '../DependencyInjection/DependencyAware.class';
import DependencyInjection from '../DependencyInjection/DependencyInjection.class';

function replaceErrors(key, value) {
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
}


const logger = Winston.createLogger({
  level: 'info',
  format: Winston.format.combine(
    Winston.format.json({ replacer: replaceErrors }),
  ),
  transports: [
    new Winston.transports.Console(),
  ],
});

// Instantiate the raven client
if (typeof process.env.RAVEN_DSN !== 'undefined' && isOffline === false) {
  Raven.config(process.env.RAVEN_DSN, {
    sendTimeout: 5,
    environment: process.env.STAGE,
  }).install();
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
    const isOffline = context.invokedFunctionArn.indexOf('offline') !== -1;

    // Set raven client context
    if (typeof process.env.RAVEN_DSN !== 'undefined' && isOffline === false) {
      Raven.setContext({
        extra: {
          Event: event,
          Context: context,
        },
        environment: process.env.STAGE,
        tags: {
          lambda: context.functionName,
          memory_size: context.memoryLimitInMB,
          log_group: context.log_group_name,
          log_stream: context.log_stream_name,
          stage: process.env.STAGE,
          path: event.path,
          httpMethod: event.httpMethod,
        },
      });

      this.raven = Raven;
    }
  }

  /**
   * Log Error Message
   * @param error object
   * @param message string
   */
  error(error, message = '') {
    if (process.env.RAVEN_DSN && error instanceof Error) {
      Raven.captureException(error);
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
      label(descriptor);
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
      metric(descriptor, stat);
    }

    if (silent === false) {
      logger.log('info', `metric - ${descriptor} - ${stat}`);
    }
  }
}
