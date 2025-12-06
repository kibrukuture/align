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
   * Optional blockchain configuration (external provider integration)
   *
   * Enables advanced blockchain features via ethers.js by configuring
   * network RPC endpoints for wallet operations, token transfers, contract
   * interactions, ENS lookups, and more. This is not part of AlignLab's
   * hosted API; it is an external provider layer used by the SDK's
   * `align.blockchain` module.
   *
   * Defaults:
   * - The SDK ships with sensible public RPC defaults for all supported networks.
   *   See `DEFAULT_NETWORK_CONFIGS` in `src/resources/blockchain/providers/providers.resource.ts:5-55`.
   *   Examples:
   *   - ethereum → `https://rpc.ankr.com/eth` (chainId 1)
   *   - polygon → `https://polygon-rpc.com` (chainId 137)
   *   - base → `https://mainnet.base.org` (chainId 8453)
   *   - arbitrum → `https://arb1.arbitrum.io/rpc` (chainId 42161)
   *   - optimism → `https://mainnet.optimism.io` (chainId 10)
   *   - solana → `https://api.mainnet-beta.solana.com`
   *   - tron → `https://api.trongrid.io`
   *
   * Override behavior:
   * - Provide `customRpcUrls` to replace the default RPC URL for specific networks.
   * - The SDK will use your custom URL when creating providers; otherwise it
   *   falls back to the default mapping. See provider selection in
   *   `src/resources/blockchain/providers/providers.resource.ts:134-138`.
   * - Changing a network’s RPC via `providers.setCustomRpc()` clears the cached
   *   provider so the next `getProvider()` reconnects to your endpoint.
   *
   * Recommended usage:
   * - Use premium RPC providers (Alchemy, Infura, QuickNode) in production for
   *   reliability, performance, and higher rate limits.
   * - Keep RPC API keys on the server side if the URL contains secrets.
   * - Prefer HTTPS URLs; avoid plain HTTP endpoints in production.
   *
   * Example: initialize SDK with custom RPCs
   * ```typescript
   * import Align from "@tolbel/align";
   *
   * const align = new Align({
   *   apiKey: process.env.ALIGNLAB_API_KEY!,
   *   blockchain: {
   *     customRpcUrls: {
   *       ethereum: "https://eth-mainnet.g.alchemy.com/v2/KEY",
   *       polygon: "https://polygon-mainnet.g.alchemy.com/v2/KEY",
   *       base: "https://mainnet.base.org",
   *     },
   *   },
   * });
   *
   * // Later: access a provider
   * const provider = align.blockchain.providers.getProvider("polygon");
   * const feeData = await provider.getFeeData();
   * ```
   *
   * Example: override at runtime
   * ```typescript
   * // Switch Ethereum RPC at runtime and reconnect on next use
   * align.blockchain.providers.setCustomRpc(
   *   "ethereum",
   *   "https://eth-mainnet.g.alchemy.com/v2/NEW_KEY"
   * );
   * ```
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
