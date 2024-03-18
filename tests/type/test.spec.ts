import { Equal, Expect } from './helpers';

it('should pass', () => {
  type test = Expect<Equal<string, string>>;
});

it('should fail', () => {
  // @ts-expect-error
  type test = Expect<Equal<string, number>>;
});
