import { describe, expect, test } from "bun:test";
import { createLogger } from "@/core/logger";

describe("Logger", () => {
  test("should create a logger with explicit enabled flag", () => {
    // Need to pass an object because createLogger(config: { ... }) doesn't have a default {}
    const logger = createLogger({ enabled: true, level: "info" });
    expect(logger).toBeDefined();
    expect(logger.level).toBe("info");
  });

  test("should create a logger with custom level", () => {
    const logger = createLogger({ enabled: true, level: "debug" });
    expect(logger.level).toBe("debug");
  });

  test("should default to silent if not enabled", () => {
    const logger = createLogger({ enabled: false });
    expect(logger.level).toBe("silent");
  });

  test("should handle empty config object", () => {
    // Based on src/core/logger.ts:17-18, it should default enabled=false, level=error
    // But since enabled is false, it returns silent.
    const logger = createLogger({});
    expect(logger.level).toBe("silent");
  });
});
