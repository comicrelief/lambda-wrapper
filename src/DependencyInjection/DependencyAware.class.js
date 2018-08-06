import DependencyInjection from './DependencyInjection.class';

/**
 * DependencyAwareClass Class
 */
export default class DependencyAwareClass {
  /**
   * DependencyAwareClass constructor
   * @param di
   */
  constructor(di: DependencyInjection) {
    this.di = di;
  }

  /**
   * Get Dependency Injection Container
   * @return {*}
   */
  getContainer(): DependencyInjection {
    return this.di;
  }
}
