import {
  Dash0Telemetry,
} from '@/src';

describe('unit.telemetry.Dash0', () => {
  describe('isEnabled', () => {
    describe('when all Dash0 env vars are present', () => {
      beforeAll(() => {
        process.env.AWS_LAMBDA_EXEC_WRAPPER = '/opt/wrapper';
        process.env.DASH0_ENDPOINT = 'test';
        process.env.DASH0_TOKEN = 'test';
        process.env.DASH0_DATASET = 'test';
      });

      afterAll(() => {
        delete process.env.AWS_LAMBDA_EXEC_WRAPPER;
        delete process.env.DASH0_ENDPOINT;
        delete process.env.DASH0_TOKEN;
        delete process.env.DASH0_DATASET;
      });

      it('should return true', () => {
        expect(Dash0Telemetry.isEnabled).toBe(true);
      });
    });

    describe('when Dash0 env vars not are present', () => {
      beforeAll(() => {
        delete process.env.AWS_LAMBDA_EXEC_WRAPPER;
        delete process.env.DASH0_ENDPOINT;
        delete process.env.DASH0_TOKEN;
        delete process.env.DASH0_DATASET;
      });

      it('should return false', () => {
        expect(Dash0Telemetry.isEnabled).toBe(false);
      });
    });
  });
});
