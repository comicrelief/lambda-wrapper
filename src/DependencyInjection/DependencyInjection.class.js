import { DEFINITIONS, DEPENDENCIES } from '../Config/Dependencies';

/**
 * DependencyInjection class
 */
export default class DependencyInjection {
  /**
   * DependencyInjection constructor
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
   * @param definition
   * @return {*}
   */
  get(definition) {
    if (typeof this.dependencies[definition] === 'undefined') {
      throw Error(`${definition} does not exist in di container`);
    }

    return this.dependencies[definition];
  }

  /**
   * Get Event
   * @return {*}
   */
  getEvent() {
    return this.event;
  }

  /**
   * Get Context
   * @return {*}
   */
  getContext() {
    return this.context;
  }

  /**
   * Get Configuration
   * @param definition string
   * @return {*}
   */
  getConfiguration(definition = null) {
    if (definition !== null && typeof this.configuration[definition] === 'undefined') {
      return null;
    } else if (typeof this.configuration[definition] !== 'undefined') {
      return this.configuration[definition];
    }

    return this.configuration;
  }
}
