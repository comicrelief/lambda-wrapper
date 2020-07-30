import ServerlessMochaPlugin from 'serverless-mocha-plugin';

import LambdaTermination from '../../../src/Wrapper/LambdaTermination';


const expect = ServerlessMochaPlugin.chai.expect;

describe('Wrapper/LambdaTermination', () => {
  describe('Stores the custom fields', () => {
    const props = {
      internal: 'INTERNAL',
      code: 401,
      body: 'BODY',
    };

    const lt = new LambdaTermination(props.internal, props.code, props.body);

    Object.entries(props)
      .forEach(([key, value]) => {
        it(`Exposes '${key}'`, () => {
          expect(lt[key]).to.be.equal(value);
        });
      });
  });

  it('Generates an error', () => {
    const lt = new LambdaTermination('internal');
    expect(lt instanceof Error).to.be.true;
  });

  describe('Passes a prop to the superclass that', () => {
    it('Becomes Error.message', () => {
      const lt = new LambdaTermination('abc');
      expect(lt.message).to.be.equal('abc');
    });

    it('Is stringified when an object', () => {
      const details = { a: 1 };
      const stringified = JSON.stringify(details);
      const lt = new LambdaTermination(details);
      expect(lt.message).to.be.equal(stringified);
    });
  });
});
