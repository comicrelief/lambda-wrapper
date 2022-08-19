import DependencyAwareClass from '../core/dependency-base';
import LoggerService from './LoggerService';

/**
 * Timer helper that can be used to measure how long operations take.
 */
export default class TimerService extends DependencyAwareClass {
  timers: Record<string, number> = {};

  /**
   * Start a timer.
   *
   * To stop the timer, call `stop()` with the same `identifier`.
   *
   * @param identifier
   */
  start(identifier: string) {
    this.timers[identifier] = Date.now();
  }

  /**
   * Stop a timer and log the elapsed time.
   *
   * @param identifier
   */
  stop(identifier: string) {
    if (identifier in this.timers) {
      const logger = this.di.get(LoggerService);
      const duration = Date.now() - this.timers[identifier];
      logger.info(`Timing - ${identifier} took ${duration} ms to complete`);
    }
  }
}
