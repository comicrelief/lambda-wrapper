import { Context } from 'aws-lambda';

import DependencyAwareClass from './DependencyAwareClass';
import { LambdaWrapperConfig } from './config';

// eslint-disable-next-line no-use-before-define
type Class<T> = new (di: DependencyInjection) => T;

/**
 * Dependency injection container.
 *
 * Dependencies (singleton instances of dependency-aware classes) are provided
 * to the main Lambda handler and other dependencies via this class.
 */
export default class DependencyInjection {
  /**
   * Instantiated dependencies.
   */
  readonly dependencies: Record<string, DependencyAwareClass>;

  /**
   * True until all dependencies have been constructed.
   */
  private isConstructing = true;

  constructor(
    readonly config: LambdaWrapperConfig,
    readonly event: any,
    readonly context: Context,
  ) {
    this.dependencies = Object.fromEntries(
      Object.entries(config.dependencies)
        .map(([, Constructor]) => [Constructor.name, new Constructor(this)]),
    );

    this.isConstructing = false;
  }

  /**
   * Get the singleton instance of the given dependency.
   *
   * @param dependency
   */
  get<T extends DependencyAwareClass>(dependency: Class<T>): T {
    if (this.isConstructing) {
      throw new Error(
        'Dependencies are not available in dependency class constructors.\n\n'
        + 'To fix this, call `di.get` in the function where the dependency is'
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
}
