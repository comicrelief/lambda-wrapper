import {
  LumigoTelemetry,
} from '@/src';

describe('unit.telemetry.Lumigo', () => {
  describe('isEnabled', () => {
    describe('when a Lumigo token is present', () => {
      beforeAll(() => {
        process.env.LUMIGO_TRACER_TOKEN = 'test';
      });

      afterAll(() => {
        delete process.env.LUMIGO_TRACER_TOKEN;
      });

      it('should return true', () => {
        expect(LumigoTelemetry.isEnabled).toBe(true);
      });
    });

    describe('when there is no Lumigo token', () => {
      beforeAll(() => {
        delete process.env.LUMIGO_TRACER_TOKEN;
      });

      it('should return false', () => {
        expect(LumigoTelemetry.isEnabled).toBe(false);
      });
    });
  });

  describe('isLumigoWrappingUs', () => {
    describe('when using the runtime wrapper (e.g. auto-trace)', () => {
      beforeAll(() => {
        process.env.AWS_LAMBDA_EXEC_WRAPPER = '/opt/lumigo_wrapper';
        delete process.env.LUMIGO_ORIGINAL_HANDLER;
        process.env.LUMIGO_TRACER_TOKEN = 'test';
      });

      afterAll(() => {
        delete process.env.AWS_LAMBDA_EXEC_WRAPPER;
        delete process.env.LUMIGO_TRACER_TOKEN;
      });

      it('should return true', () => {
        expect(LumigoTelemetry.isLumigoWrappingUs).toBe(true);
      });
    });

    describe('when using handler redirection', () => {
      beforeAll(() => {
        delete process.env.AWS_LAMBDA_EXEC_WRAPPER;
        process.env.LUMIGO_ORIGINAL_HANDLER = 'handler.js';
        process.env.LUMIGO_TRACER_TOKEN = 'test';
      });

      afterAll(() => {
        delete process.env.LUMIGO_ORIGINAL_HANDLER;
        delete process.env.LUMIGO_TRACER_TOKEN;
      });

      it('should return true', () => {
        expect(LumigoTelemetry.isLumigoWrappingUs).toBe(true);
      });
    });

    describe('when there is only a Lumigo token', () => {
      beforeAll(() => {
        delete process.env.AWS_LAMBDA_EXEC_WRAPPER;
        delete process.env.LUMIGO_ORIGINAL_HANDLER;
        process.env.LUMIGO_TRACER_TOKEN = 'test';
      });

      afterAll(() => {
        delete process.env.LUMIGO_TRACER_TOKEN;
      });

      it('should return false', () => {
        expect(LumigoTelemetry.isLumigoWrappingUs).toBe(false);
      });
    });

    describe('when there is no Lumigo token', () => {
      beforeAll(() => {
        delete process.env.AWS_LAMBDA_EXEC_WRAPPER;
        delete process.env.LUMIGO_TRACER_TOKEN;
      });

      it('should return false', () => {
        expect(LumigoTelemetry.isLumigoWrappingUs).toBe(false);
      });
    });
  });
});
