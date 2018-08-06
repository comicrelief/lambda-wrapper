/**
 * DependencyAwareClass Class
 */
export default class DependencyAwareClass {
  /**
   * DependencyAwareClass constructor
   * @param di DependencyInjection
   */
  constructor(di) {
    this.di = di;
  }

  /**
   * Get Dependency Injection Container
   * @return DependencyInjection
   */
  getContainer() {
    return this.di;
  }
}
