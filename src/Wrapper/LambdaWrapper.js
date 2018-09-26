import iopipe from '@iopipe/iopipe';
import profiler from '@iopipe/profiler';
import DependencyInjection from '../DependencyInjection/DependencyInjection.class';
import { DEFINITIONS } from '../Config/Dependencies';
import PromisifiedDelay from '../Chaos/PromisifiedDelay';

export default ((configuration, handler) => {
  let instance = (event, context) => {
    const di = new DependencyInjection(configuration, event, context);
    const request = di.get(DEFINITIONS.REQUEST);

    context.callbackWaitsForEmptyEventLoop = false;

    // If the event is to trigger a warm up, then don't bother returning the function.
    if (di.getEvent().source === 'serverless-plugin-warmup') {
      return context.done(null, 'Lambda is warm!');
    }

    if (typeof process.env.CHAOS !== 'undefined' && process.env.CHAOS === 'DELAYED') {
      new PromisifiedDelay()
        .get()
        .then(() => handler.call(instance, di, request, context.done));
    } else {
      return handler.call(instance, di, request, context.done);
    }
  };

  // If the IOPipe token is enabled, then wrap the instance in the IOPipe wrapper
  if (process.env.IOPIPE_TOKEN) {
    instance = iopipe({
      plugins: [profiler({ enabled: true, heapSnapshot: true })],
    })(instance);
  }

  return instance;
});
