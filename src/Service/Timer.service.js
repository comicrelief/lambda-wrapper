import DependencyAwareClass from '../DependencyInjection/DependencyAware.class';
import DependencyInjection from '../DependencyInjection/DependencyInjection.class';

/**
 * TimerService class
 */
export default class TimerService extends DependencyAwareClass {
  /**
   * TimerService constructor
   * @param di DependencyInjection
   */
  constructor(di: DependencyInjection) {
    super(di);
    this.iopipe = null;

    // Fetch iopipe from the context
    if (typeof process.env.IOPIPE_TOKEN === 'string' && process.env.IOPIPE_TOKEN !== 'undefined') {
      const container = this.getContainer();
      const context = container.getContext();
      this.iopipe = context.iopipe;
    }
  }

  /**
   * Start trace
   * @param message string
   */
  start(message) {
    if (this.iopipe) {
      const { mark } = this.iopipe;
      mark.start(message);
    }
  }

  /**
   * End trace
   * @param message string
   */
  end(message) {
    if (this.iopipe) {
      const { mark } = this.iopipe;
      mark.end(message);
    }
  }
}
