import {
  Context,
  DependencyInjection,
  LoggerService,
  TimerService,
} from '@/src';

describe('unit.services.TimerService', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should measure time between start and stop', () => {
    const di = new DependencyInjection({
      dependencies: {
        TimerService,
        LoggerService,
      },
    }, {}, {} as Context);
    const timer = di.get(TimerService);
    const logger = di.get(LoggerService);

    let info = 'logger.info not called!';
    jest.spyOn(logger, 'info').mockImplementation((msg: any) => { info = msg; });

    timer.start('test');
    jest.advanceTimersByTime(12345);
    timer.stop('test');

    expect(info).toContain('test took 12345 ms to complete');
  });
});
