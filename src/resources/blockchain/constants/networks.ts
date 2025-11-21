/**
 * Supported blockchain networks.
 *
 * Shared across validators, types, and providers to ensure consistency.
 */
export const NETWORKS = [
  "ethereum",
  "polygon",
  "base",
  "arbitrum",
  "optimism",
  "solana",
  "tron",
] as const;

export type Network = (typeof NETWORKS)[number];
