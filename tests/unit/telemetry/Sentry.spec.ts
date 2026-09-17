import {
  SentryTelemetry,
} from '@/src';

describe('unit.telemetry.Sentry', () => {
  describe('isEnabled', () => {
    describe('when a Sentry DSN is present', () => {
      beforeAll(() => {
        process.env.RAVEN_DSN = 'test';
      });

      afterAll(() => {
        delete process.env.RAVEN_DSN;
      });

      it('should return true', () => {
        expect(SentryTelemetry.isEnabled).toBe(true);
      });
    });

    describe('when there is no Sentry DSN', () => {
      beforeAll(() => {
        delete process.env.RAVEN_DSN;
      });

      it('should return false', () => {
        expect(SentryTelemetry.isEnabled).toBe(false);
      });
    });
  });
});
