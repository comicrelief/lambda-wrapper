# TimerService

Timer helper that can be used to measure how long operations take.

## Usage

Start and stop the timer using the `start` and `stop` methods.

```ts
lambdaWrapper.wrap(async (di) => {
  const timer = di.get(TimerService);

  const timerId = 'someLongSlowOperation';
  timer.start(timerId);
  await someLongSlowOperation();
  timer.stop(timerId);
  // logs 'someLongSlowOperation took 12345 ms to complete'
})
```
