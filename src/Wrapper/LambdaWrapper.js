import iopipe from '@iopipe/iopipe';
import profiler from '@iopipe/profiler';
import trace from '@iopipe/trace';

import DependencyInjection from '../DependencyInjection/DependencyInjection.class';
import { DEFINITIONS } from '../Config/Dependencies';
import ResponseModel from '../Model/Response.model';

export const LambdaWrapper = (configuration, handler, slimAction = false) => {
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

    const handlerResponse = handler.call(instance, di, request, callback);
    if (slimAction === true) {
      // Slim action by moving response handling logic here
      return handlerResponse
        .catch((error) => {
          logger.error(error);
          return (error instanceof ResponseModel) ? error : new ResponseModel({}, 500, 'unknown error');
        })
        .then(response => callback(null, (response instanceof ResponseModel) ? response.generate() : response));
    }
    return handlerResponse;
  };

  // If the IOPipe token is enabled, then wrap the instance in the IOPipe wrapper
  if (typeof process.env.IOPIPE_TOKEN === 'string' && process.env.IOPIPE_TOKEN !== 'undefined') {
    const ioPipeConfiguration = {
      plugins: [
        trace({
          autoHttp: {
            enabled: false,
          },
        }),
      ],
    };

    if (typeof process.env.IOPIPE_TRACING !== 'undefined' && process.env.IOPIPE_TRACING === 'enabled') {
      ioPipeConfiguration.plugins.push(profiler({ enabled: true, heapSnapshot: true }));
    }

    instance = iopipe(ioPipeConfiguration)(instance);
  }

  return instance;
};

export const LambdaWrapperV2 = (configuration, handler) => LambdaWrapper(configuration, handler, true);
