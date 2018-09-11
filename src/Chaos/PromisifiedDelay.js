const DELAYS = {
  2000: 50,
  3500: 20,
  4000: 15,
  5000: 10,
  10000: 4,
  60000: 1,
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
