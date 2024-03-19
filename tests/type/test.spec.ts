import { expectTypeOf } from 'expect-type';

it('should pass', () => {
  expectTypeOf<string>().toEqualTypeOf<string>();
});

it('should fail', () => {
  expectTypeOf<string>().not.toEqualTypeOf<number>();
});
