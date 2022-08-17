import DependencyInjection from './dependency-injection';

/**
 * Base class for dependencies.
 */
export default class DependencyAwareClass {
  constructor(readonly di: DependencyInjection) {}

  /**
   * Get dependency injection container.
   *
   * @deprecated Use `this.di` instead.
   */
  getContainer(): DependencyInjection {
    return this.di;
  }
}
