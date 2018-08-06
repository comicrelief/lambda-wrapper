import { DEFINITIONS, DEPENDENCIES } from '../Config/Dependencies';

/**
 * DependencyInjection class
 */
export default class DependencyInjection {
  /**
   * DependencyInjection constructor
   * @param dependencies
   * @param event
   * @param context
   */
  constructor(dependencies, event, context) {
    this.event = event;
    this.context = context;

    this.dependencies = {};

    for (let x = 0; x <= 1; x += 1) {
      // Iterate over lapper dependencies and add to container
      Object.keys(DEFINITIONS).forEach((dependencyKey) => {
        this.dependencies[dependencyKey] = new DEPENDENCIES[dependencyKey](this);
      });

      // Iterate over child dependencies and add to container
      Object.keys(dependencies).forEach((dependencyKey) => {
        this.dependencies[dependencyKey] = new dependencies[dependencyKey](this);
      });
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
}
