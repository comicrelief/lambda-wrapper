import * as lumigo from '@lumigo/tracer';

import { Context } from '../index';
import ResponseModel from '../models/ResponseModel';
import LoggerService from '../services/LoggerService';
import RequestService from '../services/RequestService';
import DependencyAwareClass from './DependencyAwareClass';
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
  constructor(readonly config: TConfig) {
    LambdaWrapper.validateConfig(config);
  }

  /**
   * Validate the given config object.
   *
   * This is mainly to benefit projects that are not using TypeScript, where
   * missing properties or incorrect types would not otherwise be flagged up.
   *
   * @param config
   */
  static validateConfig(config: LambdaWrapperConfig): void {
    if (!config.dependencies) {
      throw new TypeError("config is missing the 'dependencies' key");
    }

    Object.values(config.dependencies).forEach((dep) => {
      if (!(dep.prototype instanceof DependencyAwareClass)) {
        throw new TypeError(`dependency '${dep.name}' does not extend DependencyAwareClass`);
      }
    });
  }

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
  wrap<T>(
    handler: (di: DependencyInjection<TConfig>) => T | Promise<T>,
    options?: WrapOptions,
  ) {
    const {
      handleUncaughtErrors = true,
    } = options || {};

    let wrapper = async (event: any, context: Context) => {
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
    if (LambdaWrapper.isLumigoEnabled && !LambdaWrapper.isLumigoWrappingUs) {
      const tracer = lumigo.initTracer({ token: process.env.LUMIGO_TRACER_TOKEN });

      // Lumigo's wrapper works with both callbacks or promises handlers, and
      // the returned function behaves the same way as the original. For our
      // promise-based handler we can safely coerce the type.
      wrapper = tracer.trace(wrapper) as (event: any, context: Context) => Promise<any>;
    }

    return wrapper;
  }

  /**
   * `true` if we will send traces to Lumigo.
   *
   * The `LUMIGO_TRACER_TOKEN` env var is present in both manually traced and
   * auto-traced functions.
   */
  static get isLumigoEnabled(): boolean {
    return !!process.env.LUMIGO_TRACER_TOKEN;
  }

  /**
   * `true` if the Lambda function is already being traced by a higher-level
   * Lumigo wrapper, in which case we don't need to manually wrap our handlers.
   *
   * There are two ways that this can be done, based on the documentation
   * [here](https://docs.lumigo.io/docs/lambda-layers): using a Lambda runtime
   * wrapper, or handler redirection. Each method can be detected via its
   * environment variables. Auto-trace uses the runtime wrapper.
   */
  static get isLumigoWrappingUs(): boolean {
    return this.isLumigoEnabled && (
      process.env.AWS_LAMBDA_EXEC_WRAPPER === '/opt/lumigo_wrapper'
      || !!process.env.LUMIGO_ORIGINAL_HANDLER
    );
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
   * Gracefully handles an error, logging in Lumigo and generating a response
   * reflecting the `code` of the error, if defined.
   *
   * Lumigo generates alerts for logs on level ERROR. This means that
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
