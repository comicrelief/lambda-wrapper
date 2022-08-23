import Epsagon from 'epsagon';

import { Context, Handler } from '../index';
import DependencyInjection from './DependencyInjection';
import { LambdaWrapperConfig, mergeConfig } from './config';

export default class LambdaWrapper<TConfig extends LambdaWrapperConfig = LambdaWrapperConfig> {
  constructor(readonly config: TConfig) {}

  /**
   * Returns a new Lambda Wrapper with the given configuration applied.
   *
   * @param config
   */
  configure<TMoreConfig>(config: Partial<TConfig> & TMoreConfig): LambdaWrapper<TConfig & TMoreConfig> {
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
