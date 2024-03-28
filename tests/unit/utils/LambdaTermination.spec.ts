import { LambdaTermination } from '@/src';

describe('unit.utils.LambdaTermination', () => {
  describe('custom fields', () => {
    const properties = {
      internal: 'INTERNAL',
      code: 401,
      body: 'BODY',
    };

    const lt = new LambdaTermination(properties.internal, properties.code, properties.body);

    Object.entries(properties).forEach(([key, value]) => {
      it(`should set and expose '${key}'`, () => {
        expect(lt[key as keyof LambdaTermination]).toEqual(value);
      });
    });
  });

  it('should create an instance of error', () => {
    const lt = new LambdaTermination('internal');
    expect(lt).toBeInstanceOf(Error);
  });

  describe('error message', () => {
    it('should use `internal` param when a string', () => {
      const lt = new LambdaTermination('abc');
      expect(lt.message).toEqual('abc');
    });

    it('should use stringified `internal` param when an object', () => {
      const details = { a: 1 };
      const stringified = JSON.stringify(details);
      const lt = new LambdaTermination(details);
      expect(lt.message).toEqual(stringified);
    });
  });
});
