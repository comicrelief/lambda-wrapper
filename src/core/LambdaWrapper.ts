import * as lumigo from '@lumigo/tracer';

import { Context, Handler } from '../index';
import ResponseModel from '../models/ResponseModel';
import LoggerService from '../services/LoggerService';
import RequestService from '../services/RequestService';
import DependencyInjection from './DependencyInjection';
import { LambdaWrapperConfig, mergeConfig } from './config';

export interface WrapOptions {
  /**
   * Whether uncaught errors should be handled to return an HTTP 500 response
   * instead of causing a function error. (default: `true`)
   *
   * This is what you usually want when working on an HTTP endpoint, but in
   * other contexts (e.g. queue consumers) you may want AWS Lambda to report a
   * failure so that the event is retried.
   */
  handleUncaughtErrors?: boolean;
}

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
  wrap<T>(handler: (di: DependencyInjection<TConfig>) => Promise<T>, options?: WrapOptions) {
    const {
      handleUncaughtErrors = true,
    } = options || {};

    let wrapper: Handler = async (event: any, context: Context) => {
      const di = new DependencyInjection(this.config, event, context);
      const request = di.get(RequestService);
      const logger = di.get(LoggerService);

      context.callbackWaitsForEmptyEventLoop = false;

      // if the event is a warmup, don't bother running the function
      if (event.source === 'serverless-plugin-warmup') {
        return 'Lambda is warm!';
      }

      // log the user's IP address silently for use in error tracing
      const ipAddress = request.getIp();
      if (ipAddress) {
        logger.metric('ipAddress', ipAddress, true);
      }

      // add metrics with user browser information for rapid debugging
      const userBrowserAndDevice = request.getUserBrowserAndDevice();
      if (userBrowserAndDevice) {
        Object.entries(userBrowserAndDevice).forEach(([key, value]) => {
          logger.metric(key, value, true);
        });
      }

      try {
        const result = await handler.call(wrapper, di);
        return LambdaWrapper.handleSuccess(di, result);
      } catch (error: any) {
        const handled = LambdaWrapper.handleError(di, error, !handleUncaughtErrors);

        if (!handleUncaughtErrors) {
          // AWS Lambda with async handler is looking for a rejection
          // and not an error object directly
          // and will treat resolved errors as successful
          // as it will cast the error to JSON, i.e. `{}`
          throw handled;
        }

        return handled;
      }
    };

    // If Lumigo is enabled, wrap the handler in the Lumigo wrapper
    if (process.env.LUMIGO_TOKEN) {
      const tracer = lumigo.initTracer({ token: process.env.LUMIGO_TOKEN });

      wrapper = tracer.trace(wrapper);
    }

    return wrapper;
  }

  /**
   * Process the result once we have one.
   *
   * @param di
   * @param result
   */
  static handleSuccess(di: DependencyInjection, result: any) {
    const logger = di.get(LoggerService);

    // result may be undefined as not all lambdas have a return value
    logger.metric('lambda.statusCode', result?.statusCode || 200);

    return result;
  }

  /**
   * Gracefully handles an error, logging in Epsagon and generating a response
   * reflecting the `code` of the error, if defined.
   *
   * Note about Epsagon:
   * Epsagon generates alerts for logs on level ERROR. This means that
   * `logger.error` will produce an alert. To avoid meaningless notifications,
   * most likely coming from tests, we log INFO unless either:
   *
   * 1. `error.raiseOnEpsagon` is defined & truthy
   * 2. `error.code` is defined and `error.code >= 500`.
   *
   * @param di
   * @param error
   * @param [throwError=false]
   */
  static handleError(di: DependencyInjection, error: Error, throwError = false) {
    const logger = di.get(LoggerService);

    const {
      code,
      raiseOnEpsagon,
      body = {},
      details = 'unknown error',
    } = error as any;

    logger.metric('lambda.statusCode', code || 500);

    if (raiseOnEpsagon || !code || code >= 500) {
      logger.error(error);
    } else {
      logger.info(error);
    }

    if (throwError) {
      if (error instanceof Error) {
        return error;
      }

      // We want to be absolutely sure that we are returning an error, as
      // Lambda sync handlers will only fail if the object is instanceof Error
      return new Error(error);
    }

    return ResponseModel.generate(body, code || 500, details);
  }
}
