import LoggerService from '../services/LoggerService';

/**
 * Base class for integrating `LoggerService` with a telemetry platform.
 */
export default abstract class TelemetryProvider {
  /**
   * Determine whether this telemetry provider is enabled.
   *
   * Must be overridden in subclasses.
   */
  static get isEnabled(): boolean {
    return false;
  }

  constructor(readonly logger: LoggerService) {}

  /**
   * Label the current Lambda invocation.
   *
   * A label is either present or not present, and has no associated value. Use
   * them to help categorise traces or signal certain conditions.
   *
   * If you are setting several mutually exclusive labels, using a single tag
   * may be more effective.
   *
   * @param label The name of the label.
   */
  abstract label(label: string): void;

  /**
   * Attach a tag to the current Lambda invocation.
   *
   * Tags are a key-value pair, and are typically searchable within the
   * telemetry platform. Use them to attach performance metrics or significant
   * outcomes to traces.
   *
   * @param key The name of the tag.
   * @param value The value to record.
   */
  abstract tag(key: string, value: any): void;

  /**
   * Attach an error to the current Lambda invocation.
   *
   * Typically this will generate an alert on the telemetry platform, depending
   * on configuration, but will not mark the invocation as failed.
   *
   * @param error The `Error` instance to report.
   * @param message An optional message to accompany the error. On some
   *   telemetry platforms, this allows you to surface additional context
   *   about the error.
   */
  abstract error(error: Error, message?: string): void;
}
