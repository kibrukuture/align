/**
 * Blockchain Resource - Main Container Class
 *
 * This is the main container class that provides access to all blockchain functionality.
 * It follows the same pattern as the Align class - holding resource instances.
 *
 * Structure:
 * - providers: Shared provider management (cached RPC connections)
 * - wallets: Wallet operations (creation, encryption, transactions)
 * - transactions: Transaction operations (sending, monitoring, gas estimation)
 * - tokens: Token operations (balance, addresses, formatting)
 * - utils: Utility functions (address validation, formatting)
 *
 * Usage:
 * ```typescript
 * const align = new Align({ apiKey: '...' });
 * const wallet = await align.blockchain.wallets.create();
 * const balance = await align.blockchain.wallets.getBalance(wallet.address, 'polygon');
 * ```
 */

import { ProvidersResource } from "@/resources/blockchain/providers/providers.resource";
import { WalletsResource } from "@/resources/blockchain/wallets/wallets.resource";
import { TransactionsResource } from "@/resources/blockchain/transactions/transactions.resource";
import { TokensResource } from "@/resources/blockchain/tokens/tokens.resource";
import * as Utils from "@/resources/blockchain/utils";
import type { BlockchainConfig } from "@/resources/blockchain/blockchain.types";

export class BlockchainResource {
  /**
   * Provider management
   * Shared resource that manages RPC provider instances and network configurations.
   * Other resources use this to get providers for blockchain interactions.
   */
  public readonly providers: ProvidersResource;

  /**
   * Wallet operations
   * - Create wallets (random, from mnemonic, from private key, from encrypted)
   * - Get wallet information (address, balance, token balance)
   * - Send transactions (native tokens, ERC-20 tokens)
   * - Encrypt/decrypt wallets for secure storage
   */
  public readonly wallets: WalletsResource;

  /**
   * Transaction operations
   * - Send transactions (native tokens, ERC-20 tokens)
   * - Monitor transaction status and wait for confirmations
   * - Estimate gas costs for transactions
   */
  public readonly transactions: TransactionsResource;

  /**
   * Token operations
   * - Get token balances (single or multiple)
   * - Get token addresses and information
   * - Format token amounts (with decimals)
   */
  public readonly tokens: TokensResource;

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
   * Initialize the Blockchain Resource
   *
   * @param config - Optional configuration for blockchain operations
   * @param config.customRpcUrls - Custom RPC URLs for specific networks
   */
  constructor(config?: BlockchainConfig) {
    // Initialize providers first (shared state)
    this.providers = new ProvidersResource(config);

    // Initialize other resources, passing providers for shared state
    this.wallets = new WalletsResource(this.providers);
    this.transactions = new TransactionsResource(this.providers);
    this.tokens = new TokensResource(this.providers);
  }
}
