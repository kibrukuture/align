import { JsonRpcProvider } from "ethers";
import type { NetworkConfig } from "@/resources/blockchain/providers/providers.types";
import type { Network } from "@/resources/blockchain/constants/networks";

const DEFAULT_NETWORK_CONFIGS: Record<Network, NetworkConfig> = {
  ethereum: {
    chainId: 1,
    name: "Ethereum Mainnet",
    rpcUrl: "https://rpc.ankr.com/eth",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    blockExplorer: "https://etherscan.io",
  },
  polygon: {
    chainId: 137,
    name: "Polygon",
    rpcUrl: "https://polygon-rpc.com",
    nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
    blockExplorer: "https://polygonscan.com",
  },
  base: {
    chainId: 8453,
    name: "Base",
    rpcUrl: "https://mainnet.base.org",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    blockExplorer: "https://basescan.org",
  },
  arbitrum: {
    chainId: 42161,
    name: "Arbitrum One",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    blockExplorer: "https://arbiscan.io",
  },
  optimism: {
    chainId: 10,
    name: "Optimism",
    rpcUrl: "https://mainnet.optimism.io",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    blockExplorer: "https://optimistic.etherscan.io",
  },
  solana: {
    chainId: 0,
    name: "Solana",
    rpcUrl: "https://api.mainnet-beta.solana.com",
    nativeCurrency: { name: "Solana", symbol: "SOL", decimals: 9 },
    blockExplorer: "https://solscan.io",
  },
  tron: {
    chainId: 0,
    name: "Tron",
    rpcUrl: "https://api.trongrid.io",
    nativeCurrency: { name: "Tron", symbol: "TRX", decimals: 6 },
    blockExplorer: "https://tronscan.org",
  },
};
/**
 * Providers
 *
 * Manages connections to blockchain networks (RPC providers).
 * This class acts as a singleton-like registry that:
 * 1. Maintains active connections to different chains
 * 2. Handles network configuration
 * 3. Supports custom RPC URLs
 * 4. Caches providers for performance
 *
 * **Key Features:**
 * - Lazy initialization of providers
 * - Connection pooling/caching
 * - Support for all major EVM chains
 * - Custom RPC configuration
 *
 * @example
 * Initialize the resource
 * ```typescript
 * const providers = new Providers({
 *   ethereum: 'https://eth-mainnet.g.alchemy.com/v2/...',
 *   polygon: 'https://polygon-mainnet.g.alchemy.com/v2/...'
 * });
 * ```
 */
export class Providers {
  // Cache provider instances (expensive to create)
  private providers: Map<Network, JsonRpcProvider> = new Map();

  // Store network configurations
  private networkConfigs: Map<Network, NetworkConfig> = new Map();

  // Store custom RPC URLs if user sets them
  private customRpcUrls: Map<Network, string> = new Map();

  constructor(config?: { customRpcUrls?: Partial<Record<Network, string>> }) {
    // Initialize network configurations
    Object.entries(DEFAULT_NETWORK_CONFIGS).forEach(([network, cfg]) => {
      this.networkConfigs.set(network as Network, cfg);
    });

    if (config?.customRpcUrls) {
      Object.entries(config.customRpcUrls).forEach(([network, url]) => {
        this.customRpcUrls.set(network as Network, url);
      });
    }
  }

  /**
   * Gets an active JSON-RPC provider for the specified network
   *
   * Returns a cached provider instance if one exists, or creates a new one.
   * This ensures we don't create multiple connections to the same network,
   * which saves memory and prevents hitting rate limits.
   *
   * @param {Network} network - The network identifier (e.g., "ethereum", "polygon")
   *
   * @returns {JsonRpcProvider} An ethers.js JsonRpcProvider instance
   *
   * @throws {Error} If the network is not supported
   *
   * @example
   * ```typescript
   * const provider = align.blockchain.providers.getProvider("polygon");
   * const feeData = await provider.getFeeData();
   * ```
   */
  public getProvider(network: Network): JsonRpcProvider {
    const cached = this.providers.get(network);
    if (cached) {
      return cached;
    }

    const config = this.networkConfigs.get(network);
    if (!config) {
      throw new Error(`Unsupported network: ${network}`);
    }

    const rpcUrl = this.customRpcUrls.get(network) ?? config.rpcUrl;
    const provider = new JsonRpcProvider(rpcUrl, {
      name: network,
      chainId: config.chainId,
    });

    this.providers.set(network, provider);
    return provider;
  }

  /**
   * Overrides the default RPC URL for a specific network
   *
   * Useful for using premium RPC providers (Alchemy, Infura, QuickNode) instead
   * of public endpoints, or for connecting to local development nodes.
   *
   * **Note:** This clears the cached provider for this network, forcing a reconnection
   * on the next `getProvider` call.
   *
   * @param {Network} network - The network to configure
   * @param {string} rpcUrl - The new RPC URL
   *
   * @example
   * Using Alchemy
   * ```typescript
   * align.blockchain.providers.setCustomRpc(
   *   "ethereum",
   *   "https://eth-mainnet.g.alchemy.com/v2/YOUR-API-KEY"
   * );
   * ```
   */
  public setCustomRpc(network: Network, rpcUrl: string): void {
    this.customRpcUrls.set(network, rpcUrl);
    this.providers.delete(network);
  }

  /**
   * Retrieves configuration details for a supported network
   *
   * @param {Network} network - The network identifier
   *
   * @returns {NetworkConfig} Configuration object containing chainId, name, currency, etc.
   *
   * @throws {Error} If the network is not supported
   *
   * @example
   * ```typescript
   * const config = align.blockchain.providers.getNetworkInfo("base");
   * console.log(`Chain ID: ${config.chainId}`); // 8453
   * ```
   */
  public getNetworkInfo(network: Network): NetworkConfig {
    const config = this.networkConfigs.get(network);
    if (!config) {
      throw new Error(`Unsupported network: ${network}`);
    }
    return config;
  }
}
