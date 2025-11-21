/**
 * Provider Type Definitions
 *
 * This file contains all TypeScript interfaces and types related to providers:
 * - Provider configuration
 * - Network information structure
 * - RPC provider types
 * - Provider status information
 *
 * These types ensure type safety across all provider operations.
 */

import type { JsonRpcProvider } from "ethers";
import type { Network } from "../wallets/wallets.types";

/**
 * Network configuration
 *
 * Contains all information needed to connect to a blockchain network
 *
 * @example
 * ```typescript
 * const config: NetworkConfig = {
 *   chainId: 137,
 *   name: 'Polygon',
 *   rpcUrl: 'https://polygon-rpc.com',
 *   nativeCurrency: {
 *     name: 'MATIC',
 *     symbol: 'MATIC',
 *     decimals: 18
 *   },
 *   blockExplorer: 'https://polygonscan.com'
 * };
 * ```
 */
export interface NetworkConfig {
  /**
   * Chain ID for the network
   */
  chainId: number;

  /**
   * Human-readable network name
   */
  name: string;

  /**
   * Default RPC URL for the network
   */
  rpcUrl: string;

  /**
   * Native currency information
   */
  nativeCurrency: {
    /**
     * Currency name (e.g., "Ether", "MATIC")
     */
    name: string;

    /**
     * Currency symbol (e.g., "ETH", "MATIC")
     */
    symbol: string;

    /**
     * Number of decimals
     */
    decimals: number;
  };

  /**
   * Block explorer URL
   */
  blockExplorer: string;
}

/**
 * Provider type identifier
 *
 * @example
 * ```typescript
 * const providerType: ProviderType = 'infura';
 * ```
 */
export type ProviderType = "infura" | "alchemy" | "llamarpc" | "custom";

/**
 * Provider status information
 *
 * @example
 * ```typescript
 * const status: ProviderStatus = {
 *   connected: true,
 *   network: 'polygon',
 *   latency: 150
 * };
 * ```
 */
export interface ProviderStatus {
  /**
   * Whether the provider is connected
   */
  connected: boolean;

  /**
   * Network the provider is connected to
   */
  network: Network;

  /**
   * Connection latency in milliseconds (if available)
   */
  latency?: number;

  /**
   * Last error message (if connection failed)
   */
  lastError?: string;
}

/**
 * RPC provider configuration
 *
 * Configuration for creating RPC providers
 *
 * @example
 * ```typescript
 * const config: RpcProviderConfig = {
 *   network: 'polygon',
 *   rpcUrl: 'https://polygon-rpc.com',
 *   apiKey: 'your-api-key'
 * };
 * ```
 */
export interface RpcProviderConfig {
  /**
   * Network identifier
   */
  network: Network;

  /**
   * RPC URL (required for custom providers)
   */
  rpcUrl?: string;

  /**
   * API key (for Infura, Alchemy, etc.)
   */
  apiKey?: string;

  /**
   * Provider type
   */
  providerType?: ProviderType;
}

/**
 * Internal provider wrapper
 *
 * Contains the ethers.js provider instance and metadata
 * Used internally by ProvidersResource
 */
export interface ProviderWrapper {
  /**
   * The ethers.js JsonRpcProvider instance
   */
  provider: JsonRpcProvider;

  /**
   * Network configuration
   */
  networkConfig: NetworkConfig;

  /**
   * Provider status
   */
  status: ProviderStatus;

  /**
   * Custom RPC URL if set
   */
  customRpcUrl?: string;
}
