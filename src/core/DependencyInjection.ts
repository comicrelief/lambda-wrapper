import { Context } from 'aws-lambda';

import DependencyAwareClass from './DependencyAwareClass';
import { LambdaWrapperConfig } from './config';

// eslint-disable-next-line no-use-before-define
type Class<TInstance, TConfig extends LambdaWrapperConfig> = new (di: DependencyInjection<TConfig>) => TInstance;

/**
 * Dependency injection container.
 *
 * Dependencies (singleton instances of dependency-aware classes) are provided
 * to the main Lambda handler and other dependencies via this class.
 */
export default class DependencyInjection<TConfig extends LambdaWrapperConfig = any> {
  /**
   * Instantiated dependencies.
   */
  readonly dependencies: Record<string, DependencyAwareClass>;

  /**
   * True until all dependencies have been constructed.
   */
  private isConstructing = true;

  constructor(
    readonly config: TConfig,
    readonly event: any,
    readonly context: Context,
  ) {
    // get unique dependency classes -- a class may be included several times,
    // but should be instantiated only once
    const classes = Array.from(new Set(Object.values(config.dependencies)));

    // guard against duplicate keys
    const countByName = classes
      .map((Constructor) => Constructor.name)
      .reduce(
        (counts, name) => ({ ...counts, [name]: (counts[name] || 0) + 1 }),
        {} as Record<string, number>,
      );
    if (Object.values(countByName).some((count) => count > 1)) {
      const duplicateNames = Object.entries(countByName)
        .filter(([, count]) => count > 1)
        .map(([name]) => name);

      // if all class names are single-letter, they're probably minified -- in
      // this case, give a hint about how to fix it
      const action = duplicateNames.every((it) => it.length === 1)
        ? "If you don't recognise the single-letter names listed above, your "
          + "bundler may be minifying your code. You'll need to disable this "
          + 'for Lambda Wrapper to work correctly. Please refer to the Notes '
          + 'section of the Lambda Wrapper readme:\n\n'
          + '  https://github.com/comicrelief/lambda-wrapper#notes'
        : 'Please ensure that all dependency classes have a unique name.';

      throw new Error(
        `Dependency names are not unique: ${duplicateNames.join(', ')}\n\n${action}`,
      );
    }

    // instantiate all dependencies
    this.dependencies = Object.fromEntries(
      classes.map((Constructor) => [Constructor.name, new Constructor(this)]),
    );

    this.isConstructing = false;
  }

  /**
   * Get the singleton instance of the given dependency.
   *
   * @param dependency
   */
  get<T extends DependencyAwareClass>(dependency: Class<T, TConfig>): T {
    if (this.isConstructing) {
      throw new Error(
        'Dependencies are not available in dependency class constructors.\n\n'
        + 'To fix this, call `di.get` in the function where the dependency is '
        + 'used instead of inside your constructor.',
      );
    }

    const name = dependency.name;

    if (!this.dependencies[name]) {
      throw new Error(
        `${name} does not exist in dependency container\n\n`
        + `Make sure you've included ${name} in the 'dependencies' key of your `
        + 'Lambda Wrapper config.',
      );
    }

    return this.dependencies[name] as T;
  }

  /**
   * Get the event passed to AWS Lambda.
   *
   * @deprecated Use `di.event` instead.
   */
  getEvent() {
    return this.event;
  }

  /**
   * Get the AWS Lambda context object.
   *
   * @deprecated Use `di.context` instead.
   */
  getContext() {
    return this.context;
  }

  /**
   * Get Lambda Wrapper configuration.
   *
   * @deprecated Use `di.config` instead.
   */
  getConfiguration() {
    return this.config;
  }

  /**
   * True if the function is being executed in `serverless-offline`.
   *
   * We use the following checks for this:
   *
   * - if there is no function ARN, or the ARN includes 'offline'
   * - if `process.env.USE_SERVERLESS_OFFLINE` is set
   *
   * TODO: This is nothing to do with dependency injection and should be moved
   *   somewhere else! Any ideas?
   */
  get isOffline(): boolean {
    return !this.context.invokedFunctionArn
      || this.context.invokedFunctionArn.includes('offline')
      || !!process.env.USE_SERVERLESS_OFFLINE;
  }

  /**
   * Get the `service-stage-` prefix added by Serverless to deployed Lambda
   * function names. This is handy when you want to invoke other functions,
   * without having to hardcode the service name and stage.
   *
   * The returned prefix includes a trailing dash. To get the deployed name of
   * another Lambda function, concatenate its serverless function name (its key
   * in `serverless.yml`) onto the prefix:
   *
   * ```js
   * const serverlessFunctionName = 'MyFunction';
   * const deployedName = `${di.getLambdaPrefix()}${serverlessFunctionName}`;
   * ```
   *
   * This function relies on looking at the currently running Lambda function's
   * resource name. It will not work correctly if the Lambda function has been
   * given a custom resource name.
   */
  getLambdaPrefix(): string {
    const stage = process.env.STAGE;
    if (!stage) {
      /* eslint-disable no-template-curly-in-string */
      throw new Error(
        'STAGE is not set\n\n'
        + 'Please add to your Lambda environment:\n\n'
        + '    STAGE: ${sls:stage}\n',
      );
    }
    if (!this.context.functionName) {
      throw new Error('Lambda function name is unavailable in context');
    }
    const [service] = this.context.functionName.split(`-${stage}-`);
    return `${service}-${stage}-`;
  }
}
