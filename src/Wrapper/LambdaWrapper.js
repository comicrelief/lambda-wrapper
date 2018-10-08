import iopipe from '@iopipe/iopipe';
import profiler from '@iopipe/profiler';
import trace from '@iopipe/trace';

import DependencyInjection from '../DependencyInjection/DependencyInjection.class';
import { DEFINITIONS } from '../Config/Dependencies';

export default ((configuration, handler) => {
  let instance = (event, context) => {
    const di = new DependencyInjection(configuration, event, context);
    const request = di.get(DEFINITIONS.REQUEST);

    context.callbackWaitsForEmptyEventLoop = false;

    // If the event is to trigger a warm up, then don't bother returning the function.
    if (di.getEvent().source === 'serverless-plugin-warmup') {
      return context.done(null, 'Lambda is warm!');
    }

    return handler.call(instance, di, request, context.done);
  };

  // If the IOPipe token is enabled, then wrap the instance in the IOPipe wrapper
  if (process.env.IOPIPE_TOKEN) {
    const ioPipeConfiguration = {
      plugins: [
        trace({
          autoHttp: {
            enabled: true,
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
});
