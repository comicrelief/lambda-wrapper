import { Context, Handler } from 'aws-lambda';
import Epsagon from 'epsagon';

import { LambdaWrapperConfig, mergeConfig } from './config';
import DependencyInjection from './dependency-injection';

export default class LambdaWrapper {
  constructor(readonly config: LambdaWrapperConfig) {}

  /**
   * Returns a new Lambda Wrapper with the given configuration applied.
   *
   * TODO: shall we call this `extend` instead?
   *
   * @param config
   */
  configure(config: LambdaWrapperConfig) {
    return new LambdaWrapper(mergeConfig(this.config, config));
  }

  /**
   * Wrap the given function.
   */
  wrap<T>(handler: (di: DependencyInjection) => Promise<T>): Handler {
    let wrapper = async (event: any, context: Context) => {
      const di = new DependencyInjection(this.config, event, context);

      // If the event is a warmup, don't bother running the function
      if (di.event.source === 'serverless-plugin-warmup') {
        return 'Lambda is warm!';
      }

      return handler(di);
    };

    // If Epsagon is enabled, wrap the instance in the Epsagon wrapper
    if (process.env.EPSAGON_TOKEN && process.env.EPSAGON_SERVICE_NAME) {
      Epsagon.init({
        token: process.env.EPSAGON_TOKEN,
        appName: process.env.EPSAGON_SERVICE_NAME,
      });

      wrapper = Epsagon.lambdaWrapper(wrapper);
    }

    return wrapper;
  }
}
