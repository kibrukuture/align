/**
 * Providers Resource
 *
 * This class manages RPC provider instances for different blockchain networks.
 * Caches providers to avoid recreating expensive connections.
 *
 * Handles:
 * - Provider instance creation and caching
 * - Custom RPC URL configuration
 * - Network configuration management
 * - Provider connection status
 *
 * This is a shared resource used by wallets, transactions, and tokens.
 */

import { JsonRpcProvider } from "ethers";
import type { Network } from "../wallets/wallets.types";
import type { NetworkConfig } from "./providers.types";

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
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
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

export class ProvidersResource {
  // Cache provider instances (expensive to create)
  private providers: Map<Network, JsonRpcProvider> = new Map();

  // Store network configurations
  private networkConfigs: Map<Network, NetworkConfig> = new Map();

  // Store custom RPC URLs if user sets them
  private customRpcUrls: Map<Network, string> = new Map();

  constructor(config?: { customRpcUrls?: Record<Network, string> }) {
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
   * Get or create RPC provider for a network
   * Providers are cached for efficiency
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
   * Set custom RPC URL for a network
   */
  public setCustomRpc(network: Network, rpcUrl: string): void {
    this.customRpcUrls.set(network, rpcUrl);
    this.providers.delete(network);
  }

  /**
   * Get network configuration
   */
  public getNetworkInfo(network: Network): NetworkConfig {
    const config = this.networkConfigs.get(network);
    if (!config) {
      throw new Error(`Unsupported network: ${network}`);
    }
    return config;
  }
}
