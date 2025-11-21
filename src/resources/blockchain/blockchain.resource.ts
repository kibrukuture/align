/**
 * Blockchain
 *
 * The central hub for all blockchain functionality in the Align SDK.
 * This class aggregates specialized resources for wallets, transactions, tokens, and providers.
 *
 * **Architecture:**
 * - **Providers:** Manages network connections (RPC)
 * - **Wallets:** Manages accounts, keys, and signing
 * - **Transactions:** Handles sending and monitoring transactions
 * - **Tokens:** Handles ERC-20 token interactions
 * - **Utils:** Provides common helper functions
 *
 * @example
 * Initialize the SDK
 * ```typescript
 * import { AlignSDK } from '@align/sdk';
 *
 * const sdk = new AlignSDK({ apiKey: '...' });
 *
 * // Access blockchain features
 * const wallet = await sdk.blockchain.wallets.create();
 * const balance = await sdk.blockchain.tokens.getBalance(wallet.address, 'USDC');
 * ```
 */
import { Providers } from "@/resources/blockchain/providers/providers.resource";
import { Wallets } from "@/resources/blockchain/wallets/wallets.resource";
import { Transactions } from "@/resources/blockchain/transactions/transactions.resource";
import { Tokens } from "@/resources/blockchain/tokens/tokens.resource";
import * as Utils from "@/resources/blockchain/utils";
import type { BlockchainConfig } from "@/resources/blockchain/blockchain.types";

export class Blockchain {
  /**
   * Provider management
   * Shared resource that manages RPC provider instances and network configurations.
   * Other resources use this to get providers for blockchain interactions.
   */
  public readonly providers: Providers;

  /**
   * Wallet operations
   * - Create wallets (random, from mnemonic, from private key, from encrypted)
   * - Get wallet information (address, balance, token balance)
   * - Send transactions (native tokens, ERC-20 tokens)
   * - Encrypt/decrypt wallets for secure storage
   */
  public readonly wallets: Wallets;

  /**
   * Transaction operations
   * - Send transactions (native tokens, ERC-20 tokens)
   * - Monitor transaction status and wait for confirmations
   * - Estimate gas costs for transactions
   */
  public readonly transactions: Transactions;

  /**
   * Token operations
   * - Get token balances (single or multiple)
   * - Get token addresses and information
   * - Format token amounts (with decimals)
   */
  public readonly tokens: Tokens;

  /**
   * Utility functions
   * - Address validation and formatting
   * - Amount formatting (wei <-> ether, etc.)
   */
  public readonly utils = {
    isValidAddress: Utils.isValidAddress,
    formatEther: Utils.formatEther,
    parseEther: Utils.parseEther,
  };

  /**
   * Initializes the Blockchain and its sub-resources.
   *
   * Sets up the shared Providers with any custom configuration,
   * then injects it into dependent resources (Wallets, Transactions, Tokens).
   *
   * @param {BlockchainConfig} [config] - Optional configuration
   * @param {Record<Network, string>} [config.customRpcUrls] - Custom RPC endpoints for specific networks
   *
   * @example
   * Initialize with custom RPC
   * ```typescript
   * const blockchain = new Blockchain({
   *   customRpcUrls: {
   *     ethereum: "https://eth-mainnet.g.alchemy.com/v2/KEY"
   *   }
   * });
   * ```
   */
  constructor(config?: BlockchainConfig) {
    // Initialize providers first (shared state)
    this.providers = new Providers(config);

    // Initialize sub-resources with the shared provider instance
    this.wallets = new Wallets(this.providers);
    this.transactions = new Transactions(this.providers);
    this.tokens = new Tokens(this.providers);
  }
}
