/* eslint-disable sonarjs/cognitive-complexity */
import Epsagon from 'epsagon';

import { DEFINITIONS } from '../Config/Dependencies';
import DependencyInjection from '../DependencyInjection/DependencyInjection.class';
import ResponseModel from '../Model/Response.model';

/**
 * Processes the outcome once we have one
 *
 * @param di
 * @param outcome
 */
export const handleSuccess = (di, outcome) => {
  const logger = di.get(DEFINITIONS.LOGGER);

  logger.metric('lambda.statusCode', outcome.statusCode || 200);

  return outcome;
};

/**
 * Gracefully handles an error
 * logging in Epsagon and generating
 * a response reflecting the `code`
 * of the error, if defined.
 *
 * Note about Epsagon:
 * Epsagon generates alerts for logs on level ERROR.
 * This means that logger.error will produce an alert.
 * To avoid not meaningful notifications, most likely
 * coming from tests, we log INFO unless either:
 *
 * 1. `error.raiseOnEpsagon` is defined & truthy
 * 2. `error.code` is defined and `error.code >= 500`.
 *
 * @param {DependencyInjection} di
 * @param {Error} error
 * @param {boolean} [throwError=false]
 */
export const handleError = (di, error, throwError = false) => {
  const logger = di.get(DEFINITIONS.LOGGER);

  logger.metric('lambda.returnCode', error.code || 500);

  if (error.raiseOnEpsagon || !error.code || error.code >= 500) {
    logger.error(error);
  } else {
    logger.info(error);
  }

  if (throwError) {
    if (error instanceof Error) {
      return error;
    }

    // We want to be absolutely sure
    // that we are returning an error
    // as Lambda sync handlers will only fail
    // if the object is instanceof Error
    return new Error(error);
  }

  const responseDetails = {
    body: error.body || {},
    code: error.code || 500,
    details: error.details || 'unknown error',
  };

  return ResponseModel.generate(responseDetails.body, responseDetails.code, responseDetails.details);
};

/**
 * Lambda Wrapper.
 *
 * Wraps a lambda handler, generating a new function
 * that has access to the dependency injection
 * for the service and handles logging and exceptions.
 *
 * @param configuration
 * @param handler
 * @param throwError
 */
export default (configuration, handler, throwError = false) => {
  let instance = (event, context, callback) => {
    const di = new DependencyInjection(configuration, event, context);
    const request = di.get(DEFINITIONS.REQUEST);
    const logger = di.get(DEFINITIONS.LOGGER);

    context.callbackWaitsForEmptyEventLoop = false;

    // If the event is to trigger a warm up, then don't bother returning the function.
    if (di.getEvent().source === 'serverless-plugin-warmup') {
      return callback(null, 'Lambda is warm!');
    }

    // Log the users ip address silently for use in error tracing
    if (request.getIp() !== null) {
      logger.metric('ipAddress', request.getIp(), true);
    }

    // Add metrics with user browser information for rapid debugging
    const userBrowserAndDevice = request.getUserBrowserAndDevice();
    if (userBrowserAndDevice !== null && typeof userBrowserAndDevice === 'object') {
      Object.keys(userBrowserAndDevice).forEach((metricKey) => {
        logger.metric(metricKey, userBrowserAndDevice[metricKey], true);
      });
    }

    let outcome;

    try {
      outcome = handler.call(instance, di, request, callback);

      if (outcome instanceof Promise) {
        outcome = outcome
          .then((value) => handleSuccess(di, value))
          .catch((error) => {
            const handled = handleError(di, error, throwError);

            if (throwError) {
              // AWS Lambda with async handler is looking for a rejection
              // and not an error object directly
              // and will treat resolved errors as successful
              // as it will cast the error to JSON, i.e. `{}`
              return Promise.reject(handled);
            }

            return handled;
          });
      }
    } catch (error) {
      outcome = handleError(di, error, throwError);
    }

    return outcome;
  };

  // If the Epsagon token is enabled, then wrap the instance in the Epsagon wrapper
  if (
    typeof process.env.EPSAGON_TOKEN === 'string'
    && process.env.EPSAGON_TOKEN !== 'undefined'
    && typeof process.env.EPSAGON_SERVICE_NAME === 'string'
    && process.env.EPSAGON_SERVICE_NAME !== 'undefined'
  ) {
    Epsagon.init({
      token: process.env.EPSAGON_TOKEN,
      appName: process.env.EPSAGON_SERVICE_NAME,
    });

    instance = Epsagon.lambdaWrapper(instance);
  }

  return instance;
};
