import { DEFINITIONS, DEPENDENCIES } from '../Config/Dependencies';

/**
 * DependencyInjection class
 */
export default class DependencyInjection {
  /**
   * DependencyInjection constructor
   *
   * @param configuration
   * @param event
   * @param context
   */
  constructor(configuration, event, context) {
    this.event = event;
    this.context = context;

    this.dependencies = {};
    this.configuration = configuration;

    for (let x = 0; x <= 1; x += 1) {
      // Iterate over lapper dependencies and add to container
      Object.keys(DEFINITIONS).forEach((dependencyKey) => {
        this.dependencies[dependencyKey] = new DEPENDENCIES[dependencyKey](this);
      });

      // Iterate over child dependencies and add to container
      if (typeof configuration.DEPENDENCIES !== 'undefined') {
        Object.keys(configuration.DEPENDENCIES).forEach((dependencyKey) => {
          this.dependencies[dependencyKey] = new configuration.DEPENDENCIES[dependencyKey](this);
        });
      }
    }
  }

  /**
   * Get Dependency
   *
   * @param definition
   * @returns {*}
   */
  get(definition) {
    if (typeof this.dependencies[definition] === 'undefined') {
      throw new TypeError(`${definition} does not exist in di container`);
    }

    return this.dependencies[definition];
  }

  /**
   * Get Event
   *
   * @returns {*}
   */
  getEvent() {
    return this.event;
  }

  /**
   * Get Context
   *
   * @returns {*}
   */
  getContext() {
    return this.context;
  }

  /**
   * Get Configuration
   *
   * @param definition string
   * @returns {*}
   */
  getConfiguration(definition = null) {
    if (definition !== null && typeof this.configuration[definition] === 'undefined') {
      return null;
    }
    if (typeof this.configuration[definition] !== 'undefined') {
      return this.configuration[definition];
    }

    return this.configuration;
  }

  /**
   * Check whether the function
   * is being executed in a serverless-offline context
   *
   * @returns {boolean}
   */
  get isOffline() {
    const context = this.getContext() || {};

    if (!Object.prototype.hasOwnProperty.call(context, 'invokedFunctionArn')) {
      return true;
    }

    if (context.invokedFunctionArn.includes('offline')) {
      return true;
    }

    return !!process.env.USE_SERVERLESS_OFFLINE;
  }

  /**
   * Returns the definitions
   * associated to this DependencyInjection
   * so that services can refer to them
   * without causing circular imports.
   *
   * @returns {object}
   */
  get definitions() {
    return this.configuration.DEFINITIONS;
  }
}
