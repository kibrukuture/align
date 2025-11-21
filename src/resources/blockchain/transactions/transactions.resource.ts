/**
 * Transactions Resource
 *
 * This is a thin wrapper class that handles validation, orchestration, and error handling.
 * Complex business logic is delegated to handlers in the handlers/ folder.
 *
 * Responsibilities:
 * - Input validation (using Zod schemas)
 * - Error handling and formatting
 * - Orchestrating handler calls
 * - Simple data preparation
 *
 * Business logic (transaction sending, monitoring, gas estimation) is in handlers/.
 */

import { AlignValidationError } from "@/core/errors";
import { formatZodError } from "@/core/validation";
import { ProvidersResource } from "../providers/providers.resource";
import * as Handlers from "./handlers";
import type {
  Transaction,
  TransactionStatus,
  GasEstimate,
  TransactionReceiptData,
} from "./transactions.types";
import {
  SendTransactionSchema,
  SendTokenTransactionSchema,
  GasEstimateRequestSchema,
  TransactionStatusRequestSchema,
} from "./transactions.validator";
import type {
  Wallet as SDKWallet,
  Network,
  Token,
} from "../wallets/wallets.types";
import { getTokenAddressHandler } from "../tokens/handlers/info.handler";

export class TransactionsResource {
  constructor(private providers: ProvidersResource) {}

  /**
   * Send native token transaction
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
    return Handlers.sendNativeTokenHandler(
      wallet,
      parsed.to,
      parsed.amount,
      provider
    );
  }

  /**
   * Send ERC-20 token transaction
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
    const tokenAddress = getTokenAddressHandler(parsed.token, parsed.network);

    // Call handler for complex logic
    return Handlers.sendTokenHandler(
      wallet,
      tokenAddress,
      parsed.to,
      parsed.amount,
      provider
    );
  }

  /**
   * Estimate gas for transaction
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
    const gasLimit = await Handlers.estimateGasHandler(
      parsed.from,
      parsed.to,
      parsed.amount,
      parsed.data,
      provider
    );

    const gasPrice = await Handlers.getGasPriceHandler(provider);

    return Handlers.calculateTransactionCostHandler(gasLimit, gasPrice);
  }

  /**
   * Get transaction status
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

    return Handlers.getTransactionStatusHandler(parsed.txHash, provider);
  }

  /**
   * Wait for transaction confirmation
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

    return Handlers.waitForConfirmationHandler(
      parsed.txHash,
      confirmations,
      provider
    );
  }
}
