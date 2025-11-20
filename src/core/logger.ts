import pino from "pino";

export type LogLevel = "error" | "warn" | "info" | "debug";

/**
 * Creates a pino logger instance that can be disabled in production
 *
 * @param config - Logger configuration
 * @param config.enabled - Whether logging is enabled
 * @param config.level - Log level threshold
 * @returns Pino logger instance
 */
export function createLogger(config: {
  enabled?: boolean;
  level?: LogLevel;
}): pino.Logger {
  const enabled = config.enabled ?? false;
  const level = config.level ?? "error";

  // If disabled, create a silent logger (zero overhead)
  if (!enabled) {
    return pino({
      level: "silent",
      enabled: false,
    });
  }

  // Create logger with JSON format (always)
  return pino({
    level,
    enabled: true,
  });
}
