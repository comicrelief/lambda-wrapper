const DELAYS = {
  2000: 65,
  3500: 17,
  4000: 11,
  5000: 5,
  10000: 1,
  20000: 1,
};

/**
 * PromisifiedDelay class
 */
export default class PromisifiedDelay {
  /**
   * PromisifiedDelay constructor
   */
  constructor() {
    this.delays = [];

    Object.keys(DELAYS).forEach((delayDuration) => {
      const delayIterations = DELAYS[delayDuration];

      for (let i = 0; i < delayIterations; i += 1) {
        this.delays.push(delayDuration);
      }
    });
  }

  /**
   * Create a promisified delay
   * @return {Promise<any>}
   */
  get() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, this.delays[Math.floor(Math.random() * this.delays.length)]);
    });
  }
}
