export type AlignEnvironment = "sandbox" | "production";

export interface AlignConfig {
  /**
   * Your AlignLab API Key
   */
  apiKey: string;

  /**
   * Environment to use
   * @default 'sandbox'
   */
  environment?: AlignEnvironment;

  /**
   * Custom base URL (useful for proxying)
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds
   * @default 30000
   */
  timeout?: number;

  /**
   * Enable logging
   * @default false
   */
  debug?: boolean;

  /**
   * Log level
   * @default 'error'
   */
  logLevel?: "error" | "warn" | "info" | "debug";
}

export const DEFAULT_CONFIG: Partial<AlignConfig> = {
  environment: "sandbox",
  timeout: 30000,
};

export const ALIGN_API_URLS: Record<AlignEnvironment, string> = {
  sandbox: "https://api-sandbox.alignlabs.dev/v0",
  production: "https://api.alignlabs.dev/v0",
};
