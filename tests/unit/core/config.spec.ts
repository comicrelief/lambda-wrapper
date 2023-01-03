import DependencyAwareClass from '@/src/core/DependencyAwareClass';
import { LambdaWrapperConfig, mergeConfig } from '@/src/core/config';

class A extends DependencyAwareClass {}

class B extends DependencyAwareClass {}

describe('unit.core.config', () => {
  describe('mergeConfig', () => {
    it('should return the config if no new config is given', () => {
      const a: LambdaWrapperConfig = {
        dependencies: { A, B },
      };
      const b = {};

      expect(mergeConfig(a, b)).toEqual(a);
    });

    it('should combine dependencies', () => {
      const a: LambdaWrapperConfig = {
        dependencies: { A },
      };
      const b: LambdaWrapperConfig = {
        dependencies: { B },
      };

      expect(mergeConfig(a, b)).toEqual({
        dependencies: { A, B },
      });
    });

    it('should override other keys', () => {
      type WithOtherKeys = { test: string; another: string; };

      const a: LambdaWrapperConfig & WithOtherKeys = {
        dependencies: {},
        test: 'initial',
        another: 'values',
      };
      const b: Partial<LambdaWrapperConfig> & WithOtherKeys = {
        test: 'overridden',
        another: 'here',
      };

      expect(mergeConfig(a, b)).toEqual({
        dependencies: {},
        test: 'overridden',
        another: 'here',
      });
    });
  });
});
