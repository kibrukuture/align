/**
 * Transactions
 *
 * The main entry point for transaction-related operations in the SDK.
 * This class acts as a facade/orchestrator that:
 * 1. Validates user inputs using Zod schemas
 * 2. Manages dependencies (like Providers)
 * 3. Delegates complex business logic to specialized handlers
 * 4. Standardizes error handling
 *
 * **Key Features:**
 * - Sending native transactions (ETH, MATIC)
 * - Sending ERC-20 token transactions (USDC, USDT)
 * - Gas estimation and cost calculation
 * - Transaction status monitoring
 * - Confirmation waiting
 *
 * @example
 * Initialize the resource
 * ```typescript
 * const sdk = new AlignSDK({ apiKey: '...' });
 * const transactions = sdk.blockchain.transactions;
 * ```
 */
import { AlignValidationError } from "@/core/errors";
import { formatZodError } from "@/core/validation";
import { Providers } from "@/resources/blockchain/providers/providers.resource";
import * as Handlers from "@/resources/blockchain/transactions/handlers";
import type {
  Transaction,
  TransactionStatus,
  GasEstimate,
  TransactionReceiptData,
} from "@/resources/blockchain/transactions/transactions.types"; 
import {
  SendTransactionSchema,
  SendTokenTransactionSchema,
  GasEstimateRequestSchema,
  TransactionStatusRequestSchema,
} from "@/resources/blockchain/transactions/transactions.validator";
import type {
  Wallet as SDKWallet,
  Network,
  Token,
} from "@/resources/blockchain/wallets/wallets.types";
import { getTokenAddress } from "@/resources/blockchain/tokens/handlers/info.handler";

export class Transactions {
  constructor(private providers: Providers) {}

  /**
   * Sends a native token transaction (ETH, MATIC, etc.)
   *
   * @param {SDKWallet} wallet - The sender's wallet object
   * @param {string} to - The recipient's address
   * @param {string} amount - Amount to send (e.g., "0.1")
   * @param {Network} network - The network to use
   *
   * @returns {Promise<Transaction>} The submitted transaction object
   *
   * @throws {AlignValidationError} If inputs are invalid
   * @throws {Error} If transaction fails
   *
   * @example
   * ```typescript
   * const tx = await sdk.blockchain.transactions.sendNativeToken(
   *   wallet,
   *   "0xRecipient...",
   *   "0.1",
   *   "ethereum"
   * );
   * console.log(`Tx Hash: ${tx.hash}`);
   * ```
   */
  public async sendNativeToken(
    wallet: SDKWallet,
    to: string,
    amount: string,
    network: Network
  ): Promise<Transaction> {
    // Validate inputs
    const validation = SendTransactionSchema.safeParse({ to, amount, network });
    if (!validation.success) {
      throw new AlignValidationError(
        "Invalid transaction data",
        formatZodError(validation.error)
      );
    }
    const parsed = validation.data;

    // Get provider
    const provider = this.providers.getProvider(parsed.network);

    // Call handler for complex logic
    return Handlers.sendNativeToken(
      wallet,
      parsed.to,
      parsed.amount,
      provider
    );
  }

  /**
   * Sends an ERC-20 token transaction
   *
   * @param {SDKWallet} wallet - The sender's wallet object
   * @param {Token} token - The token identifier (e.g., "usdc")
   * @param {string} to - The recipient's address
   * @param {string} amount - Amount to send (e.g., "100.0")
   * @param {Network} network - The network to use
   *
   * @returns {Promise<Transaction>} The submitted transaction object
   *
   * @throws {AlignValidationError} If inputs are invalid
   * @throws {Error} If transaction fails
   *
   * @example
   * ```typescript
   * const tx = await sdk.blockchain.transactions.sendToken(
   *   wallet,
   *   "usdc",
   *   "0xRecipient...",
   *   "50.0",
   *   "polygon"
   * );
   * ```
   */
  public async sendToken(
    wallet: SDKWallet,
    token: Token,
    to: string,
    amount: string,
    network: Network
  ): Promise<Transaction> {
    // Validate inputs
    const validation = SendTokenTransactionSchema.safeParse({
      token,
      to,
      amount,
      network,
    });
    if (!validation.success) {
      throw new AlignValidationError(
        "Invalid transaction data",
        formatZodError(validation.error)
      );
    }

    // Get provider
    const parsed = validation.data;
    const provider = this.providers.getProvider(parsed.network);

    // Resolve token contract address
    const tokenAddress = getTokenAddress(parsed.token, parsed.network);

    // Call handler for complex logic
    return Handlers.sendToken(
      wallet,
      tokenAddress,
      parsed.to,
      parsed.amount,
      provider
    );
  }

  /**
   * Estimates the gas cost for a transaction
   *
   * Calculates the estimated gas limit and total cost in native currency.
   * Useful for showing "Max Network Fee" in UIs.
   *
   * @param {string} from - Sender address
   * @param {string} to - Recipient address
   * @param {string} amount - Amount to send
   * @param {Network} network - Network to use
   * @param {string} [data] - Optional transaction data
   *
   * @returns {Promise<GasEstimate>} Gas estimation details
   *
   * @example
   * ```typescript
   * const estimate = await sdk.blockchain.transactions.estimateGas(
   *   fromAddress,
   *   toAddress,
   *   "1.0",
   *   "ethereum"
   * );
   * console.log(`Estimated Fee: ${estimate.totalCostFormatted} ETH`);
   * ```
   */
  public async estimateGas(
    from: string,
    to: string,
    amount: string,
    network: Network,
    data?: string
  ): Promise<GasEstimate> {
    // Validate inputs
    const validation = GasEstimateRequestSchema.safeParse({
      from,
      to,
      amount,
      network,
      data,
    });
    if (!validation.success) {
      throw new AlignValidationError(
        "Invalid gas estimate data",
        formatZodError(validation.error)
      );
    }

    // Get provider
    const parsed = validation.data;
    const provider = this.providers.getProvider(parsed.network);

    // Estimate gas limit and price, then calculate total cost
    const gasLimit = await Handlers.estimateGas(
      parsed.from,
      parsed.to,
      parsed.amount,
      parsed.data,
      provider
    );

    const gasPrice = await Handlers.getGasPrice(provider);

    return Handlers.calculateTransactionCost(gasLimit, gasPrice);
  }

  /**
   * Gets the current status of a transaction
   *
   * @param {string} txHash - Transaction hash
   * @param {Network} network - Network to check
   *
   * @returns {Promise<TransactionStatus>} "pending" | "confirmed" | "failed"
   *
   * @example
   * ```typescript
   * const status = await sdk.blockchain.transactions.getStatus(hash, "polygon");
   * ```
   */
  public async getStatus(
    txHash: string,
    network: Network
  ): Promise<TransactionStatus> {
    const validation = TransactionStatusRequestSchema.safeParse({
      txHash,
      network,
    });
    if (!validation.success) {
      throw new AlignValidationError(
        "Invalid transaction status request",
        formatZodError(validation.error)
      );
    }

    const parsed = validation.data;
    const provider = this.providers.getProvider(parsed.network);

    return Handlers.getTransactionStatus(parsed.txHash, provider);
  }

  /**
   * Waits for a transaction to be confirmed
   *
   * Blocks until the transaction reaches the specified number of confirmations.
   *
   * @param {string} txHash - Transaction hash
   * @param {Network} network - Network to check
   * @param {number} [confirmations=1] - Number of confirmations to wait for
   *
   * @returns {Promise<TransactionReceiptData>} The transaction receipt
   *
   * @example
   * ```typescript
   * const receipt = await sdk.blockchain.transactions.waitForConfirmation(hash, "ethereum", 3);
   * ```
   */
  public async waitForConfirmation(
    txHash: string,
    network: Network,
    confirmations: number = 1
  ): Promise<TransactionReceiptData> {
    const validation = TransactionStatusRequestSchema.safeParse({
      txHash,
      network,
    });
    if (!validation.success) {
      throw new AlignValidationError(
        "Invalid transaction hash",
        formatZodError(validation.error)
      );
    }

    const parsed = validation.data;
    const provider = this.providers.getProvider(parsed.network);

    return Handlers.waitForConfirmation(
      parsed.txHash,
      confirmations,
      provider
    );
  }
}
