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

  // Create logger with appropriate level
  return pino({
    level,
    enabled: true,
    // Pretty print in development, JSON in production
    transport:
      process.env.NODE_ENV === "development"
        ? {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "HH:MM:ss.l",
              ignore: "pid,hostname",
            },
          }
        : undefined,
  });
}
