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

/**
 * LoggerService class
 */
export default class LoggerService extends DependencyAwareClass {
  constructor(di: DependencyInjection) {
    super(di);
    this.raven = null;

    // Instantiate the raven client
    if (typeof process.env.RAVEN_DSN !== 'undefined') {
      const container = this.getContainer();
      const event = container.getEvent();
      const context = container.getContext();

      Raven.config(process.env.RAVEN_DSN).install();

      Raven.setContext({
        extra: {
          Event: event,
          Context: context,
        },
        environment: event.stage,
        tags: {
          lambda: context.functionName,
          memory_size: context.memoryLimitInMB,
          log_group: context.log_group_name,
          log_stream: context.log_stream_name,
          stage: event.stage,
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
    this.label('error');
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
   */
  label(descriptor) {
    if (typeof process.env.IOPIPE_TOKEN === 'string' && process.env.IOPIPE_TOKEN !== 'undefined') {
      label(descriptor);
    }

    logger.log('info', `label - ${descriptor}`);
  }

  /**
   * Add a metric
   * @param descriptor
   * @param stat
   */
  metric(descriptor, stat) {
    if (typeof process.env.IOPIPE_TOKEN === 'string' && process.env.IOPIPE_TOKEN !== 'undefined') {
      metric(descriptor, stat);
    }

    logger.log('info', `metric - ${descriptor} - ${stat}`);
  }
}
