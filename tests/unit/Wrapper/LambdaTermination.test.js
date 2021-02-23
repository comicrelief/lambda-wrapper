import LambdaTermination from '../../../src/Wrapper/LambdaTermination';

describe('Wrapper/LambdaTermination', () => {
  describe('Stores the custom fields', () => {
    const properties = {
      internal: 'INTERNAL',
      code: 401,
      body: 'BODY',
    };

    const lt = new LambdaTermination(properties.internal, properties.code, properties.body);

    Object.entries(properties).forEach(([key, value]) => {
      it(`Exposes '${key}'`, () => {
        expect(lt[key]).toEqual(value);
      });
    });
  });

  it('Generates an error', () => {
    const lt = new LambdaTermination('internal');
    expect(lt instanceof Error).toEqual(true);
  });

  describe('Passes a prop to the superclass that', () => {
    it('Becomes Error.message', () => {
      const lt = new LambdaTermination('abc');
      expect(lt.message).toEqual('abc');
    });

    it('Is stringified when an object', () => {
      const details = { a: 1 };
      const stringified = JSON.stringify(details);
      const lt = new LambdaTermination(details);
      expect(lt.message).toEqual(stringified);
    });
  });
});
