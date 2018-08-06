import Winston from 'winston';
import DependencyAwareClass from '../DependencyInjection/DependencyAware.class';

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
  /**
   * Log Information Message
   * @param message string
   */
  info(message) {
    logger.log('info', message);
  }

  /**
   * Log Error Message
   * @param error object
   * @param message string
   */
  error(error, message = '') {
    logger.log('error', message, { error });
  }
}
