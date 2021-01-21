import { DEFINITIONS } from '../Config/Dependencies';
import DependencyAwareClass from '../DependencyInjection/DependencyAware.class';
import DependencyInjection from '../DependencyInjection/DependencyInjection.class';

/**
 * TimerService class
 */
export default class TimerService extends DependencyAwareClass {
  /**
   * TimerService constructor
   *
   * @param di
   */
  constructor(di: DependencyInjection) {
    super(di);
    this.timers = {};
  }

  /**
   * Start timer
   *
   * @param identifier
   */
  start(identifier: string) {
    this.timers[identifier] = new Date().getTime();
  }

  /**
   * Stop timer
   *
   * @param identifier
   */
  stop(identifier: string) {
    if (typeof this.timers[identifier] !== 'undefined') {
      const duration = new Date().getTime() - this.timers[identifier];

      this.getContainer().get(DEFINITIONS.LOGGER).info(`Timing - ${identifier} took ${duration}ms to complete`);
    }
  }
}
