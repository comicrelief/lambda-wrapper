/* eslint-disable sonarjs/cognitive-complexity */
import Epsagon from 'epsagon';

import DependencyInjection from '../DependencyInjection/DependencyInjection.class';
import { DEFINITIONS } from '../Config/Dependencies';
import ResponseModel from '../Model/Response.model';

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
 * 1. `error.raiseOnEpsagon` is defined & truthy
 * 2. `error.code` is defined and `error.code >= 500`.
 *
 * @param {DependencyInjection} di
 * @param {Error} error
 */
export const handleError = (di, error) => {
  const logger = di.get(DEFINITIONS.LOGGER);

  let errorBody = error;

  // While handling an error, lambda wrapper should
  // recognise axios errors and trim down the information
  if (errorBody.isAxiosError) {
    // only keep error.config, error.response.status, error.response.data
    errorBody = {
      config: error.config,
      message: error.message,
    };

    // It's pretty common for axios errors
    // to not have.response e.g.when there's
    // a network error or timeout.
    // These errors will have .request but not .response.
    if (error.response) {
      errorBody.response = {
        status: error.response.status,
        data: error.response.data,
      };
    }
  }

  if (error.raiseOnEpsagon || !error.code || error.code >= 500) {
    logger.error(errorBody);
  } else {
    logger.info(errorBody);
  }

  const responseDetails = {
    body: error.body || {},
    code: error.code || 500,
    details: error.details || 'unknown error',
  };

  const response = new ResponseModel(responseDetails.body, responseDetails.code, responseDetails.details);

  return response.generate();
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

    try {
      let outcome = handler.call(instance, di, request, callback);

      if (outcome instanceof Promise && !throwError) {
        outcome = outcome.catch((error) => handleError(di, error));
      }

      return outcome;
    } catch (error) {
      if (throwError) {
        throw error;
      }
      return handleError(di, error);
    }
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
