const STANDARD_LATENCY_DELAYS = {
  2000: 70,
  3500: 15,
  4000: 10,
  5000: 5,
};

const HIGH_LATENCY_DELAYS = {
  2000: 65,
  3500: 15,
  4000: 9,
  5000: 5,
  10_000: 5,
  20_000: 1,
};

/**
 * PromisifiedDelay class
 */
export default class PromisifiedDelay {
  /**
   * PromisifiedDelay constructor
   *
   * @param highLatency
   */
  constructor(highLatency = true) {
    this.delays = [];

    const delayArray = highLatency === true ? HIGH_LATENCY_DELAYS : STANDARD_LATENCY_DELAYS;

    Object.keys(delayArray).forEach((delayDuration) => {
      const delayIterations = delayArray[delayDuration];

      for (let i = 0; i < delayIterations; i += 1) {
        this.delays.push(delayDuration);
      }
    });
  }

  /**
   * Create a promisified delay
   *
   * @returns {Promise<any>}
   */
  get() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, this.delays[Math.floor(Math.random() * this.delays.length)]);
    });
  }
}
