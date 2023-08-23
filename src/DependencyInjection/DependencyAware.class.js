import DependencyInjection from './DependencyInjection.class';

/**
 * DependencyAwareClass Class
 */
export default class DependencyAwareClass {
  /**
   * DependencyAwareClass constructor
   *
   * @param {DependencyInjection} di
   */
  constructor(di: DependencyInjection) {
    this.di = di;
  }

  /**
   * Get Dependency Injection Container
   *
   * @returns {DependencyInjection}
   */
  getContainer() {
    return this.di;
  }

  /**
   * Shortcut for `this.getContainer().definitions`
   *
   * @returns {object}
   */
  get definitions() {
    return this.getContainer().definitions;
  }
}
