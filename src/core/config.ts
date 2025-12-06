import type { Network } from "@/resources/blockchain/constants/networks";

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
   * Custom base URL for all Align API requests
   *
   * Overrides the default environment-based endpoints defined in `ALIGN_API_URLS` and
   * is primarily intended for reverse proxy setups in your own backend.
   *
   * When omitted, the SDK automatically selects the base URL from `ALIGN_API_URLS`
   * using the `environment` option (default: `sandbox`). See `src/core/http-client.ts:16-20`
   * for the selection logic and `src/core/config.ts:54-57` for the default mapping.
   *
   * Typical use cases:
   * - Backend reverse proxy to avoid exposing API keys in the browser
   * - Corporate networks that require traffic to go through a gateway
   * - Local development where requests are tunneled or proxied
   *
   * Requirements and recommendations:
   * - Provide a fully qualified URL (e.g., `https://api.example.com/align`).
   * - Prefer HTTPS in production; avoid plain HTTP for security-sensitive data.
   * - Do not include a trailing slash. The SDK appends resource paths internally.
   * - Ensure your proxy forwards the `Authorization` header unchanged
   *   containing your Align API key. The SDK sets this header automatically
   *   in `src/core/http-client.ts:29-36`.
   * - Forward status codes and response bodies as-is to preserve error handling.
   *
   * Example: use the default environment mapping (no proxy)
   * ```typescript
   * import Align from "@tolbel/align";
   *
   * const align = new Align({
   *   apiKey: process.env.ALIGNLAB_API_KEY!,
   *   environment: "production", // uses https://api.alignlabs.dev
   * });
   * ```
   *
   * Example: configure a backend reverse proxy
   * ```typescript
   * // Next.js (App Router) API route
   * export async function POST(req: Request) {
   *   const apiKey = process.env.ALIGNLAB_API_KEY!;
   *   const url = "https://api.alignlabs.dev/transfers/offramp/quote";
   *
   *   const res = await fetch(url, {
   *     method: "POST",
   *     headers: { Authorization: apiKey },
   *     body: await req.text(),
   *   });
   *
   *   return new Response(await res.text(), { status: res.status });
   * }
   *
   * // Client-side SDK points to your proxy instead of Align directly
   * const align = new Align({
   *   apiKey: "dummy-key-for-client", // not used by proxy
   *   baseUrl: "https://your-domain.com/api/align",
   * });
   * ```
   *
   * Notes:
   * - If `baseUrl` is set, the SDK will ignore `environment` when computing
   *   the HTTP base URL and use `baseUrl` exclusively (`src/core/http-client.ts:16-20`).
   * - Use server-side storage for real API keys; do not expose them in browsers.
   * - Ensure CORS settings on the proxy allow your client origin when needed.
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

  /**
   * Optional blockchain configuration
   * Allows users to provide custom RPC URLs for different networks
   */
  blockchain?: {
    customRpcUrls?: Record<Network, string>;
  };
}

export const DEFAULT_CONFIG: Partial<AlignConfig> = {
  environment: "sandbox",
  timeout: 30000,
};

/**
 * Default Align API endpoints keyed by environment
 *
 * The SDK uses this mapping when `AlignConfig.baseUrl` is not provided.
 * Selection occurs in `src/core/http-client.ts:16-20` using
 * `config.environment` (default: `sandbox`).
 *
 * - `sandbox`: Non-production environment for testing and development
 * - `production`: Live environment for real money flows
 *
 * Override these defaults by setting `AlignConfig.baseUrl` to point at
 * your own reverse proxy or gateway when necessary. See the `baseUrl`
 * documentation in `src/core/config.ts:17-80` for detailed guidance.
 */
export const ALIGN_API_URLS: Record<AlignEnvironment, string> = {
  sandbox: "https://api-sandbox.alignlabs.dev",
  production: "https://api.alignlabs.dev",
};
