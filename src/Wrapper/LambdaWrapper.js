import iopipe from '@iopipe/iopipe';
import DependencyInjection from '../DependencyInjection/DependencyInjection.class';
import { DEFINITIONS } from '../Config/Dependencies';

export default ((configuration, handler) => {
  const instance = (event, context) => {
    const di = new DependencyInjection(configuration, event, context);
    const request = di.get(DEFINITIONS.REQUEST);

    context.callbackWaitsForEmptyEventLoop = false;

    // If the event is to trigger a warm up, then don't bother returning the function.
    if (di.getEvent().source === 'serverless-plugin-warmup') {
      return context.done(null, 'Lambda is warm!');
    }

    return handler.call(instance, di, request, context.done);
  };


  if (process.env.IOPIPE_TOKEN) {
    return iopipe()(instance);
  }

  return instance;
});
