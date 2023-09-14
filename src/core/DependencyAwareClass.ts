import DependencyInjection from './DependencyInjection';
import { LambdaWrapperConfig } from './config';

/**
 * Base class for dependencies.
 */
export default class DependencyAwareClass<TConfig extends LambdaWrapperConfig = any> {
  constructor(readonly di: DependencyInjection<TConfig>) {}

  /**
   * Get dependency injection container.
   *
   * @deprecated Use `this.di` instead.
   */
  getContainer(): DependencyInjection {
    return this.di;
  }
}
