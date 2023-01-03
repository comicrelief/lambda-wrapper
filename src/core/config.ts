import DependencyAwareClass from './DependencyAwareClass';

/**
 * Config for Lambda Wrapper defining dependencies and their configuration.
 */
export interface LambdaWrapperConfig {
  /**
   * Dependencies to be provided by dependency injection.
   *
   * TODO: should this just be a list instead? keys are currently unused
   */
  dependencies: Record<string, typeof DependencyAwareClass>;
}

/**
 * Combine two Lambda Wrapper configs.
 *
 * @param old Current config.
 * @param new_ New config that will override the old.
 */
export function mergeConfig<
  A extends LambdaWrapperConfig,
  B extends Partial<LambdaWrapperConfig>,
>(
  old: A,
  new_: B,
): A & B {
  return {
    ...old,
    ...new_,
    dependencies: {
      ...old.dependencies,
      ...new_.dependencies,
    },
  };
}
