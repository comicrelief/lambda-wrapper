import Epsagon from 'epsagon';

import DependencyInjection from '../DependencyInjection/DependencyInjection.class';
import { DEFINITIONS } from '../Config/Dependencies';
import ResponseModel from '../Model/Response.model';

export default ((configuration, handler) => {
  let instance = (event, context, callback) => {
    const di = new DependencyInjection(configuration, event, context);
    const request = di.get(DEFINITIONS.REQUEST);
    const logger = di.get(DEFINITIONS.LOGGER);

    const handleError = (error) => {
      logger.error(error);

      const responseDetails = {
        body: error.body || {},
        code: error.code || 500,
        details: error.details || 'unknown error',
      };

      const response = new ResponseModel(
        responseDetails.body,
        responseDetails.code,
        responseDetails.details,
      );

      return response.generate();
    };

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

      if (outcome instanceof Promise) {
        outcome = outcome.catch(handleError);
      }

      return outcome;
    } catch (error) {
      return handleError(error);
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
});
