/**
 * Transaction Monitoring Handler
 *
 * This file contains the complex business logic for monitoring blockchain transactions.
 * Uses ethers.js to poll transaction status and wait for confirmations.
 *
 * Handles:
 * - Transaction status polling
 * - Waiting for transaction confirmations
 * - Transaction receipt retrieval
 * - Transaction failure detection
 * - Timeout handling
 *
 * All transaction monitoring logic is isolated here.
 */

import type { JsonRpcProvider, TransactionReceipt } from "ethers";
import type {
  Transaction,
  TransactionStatus,
  TransactionReceiptData,
} from "../transactions.types";

/**
 * Get transaction status
 *
 * Retrieves the current status of a transaction by its hash.
 *
 * @param txHash - The transaction hash
 * @param provider - The ethers.js provider instance
 * @returns Promise resolving to the transaction status
 *
 * @throws {Error} If the provider is not connected or transaction hash is invalid
 *
 * @example
 * ```typescript
 * const status = await getTransactionStatusHandler('0x1234...abcd', provider);
 * console.log(status); // "pending" | "confirmed" | "failed" | "replaced"
 * ```
 */
export async function getTransactionStatusHandler(
  txHash: string,
  provider: JsonRpcProvider
): Promise<TransactionStatus> {
  // Get transaction receipt
  const receipt = await provider.getTransactionReceipt(txHash);

  if (!receipt) {
    // Transaction not yet mined
    return "pending";
  }

  // Check if transaction was successful (status 1) or failed (status 0)
  if (receipt.status === 1) {
    return "confirmed";
  } else {
    return "failed";
  }
}

/**
 * Wait for transaction confirmation
 *
 * Waits for a transaction to be confirmed with the specified number of confirmations.
 *
 * @param txHash - The transaction hash
 * @param confirmations - Number of confirmations to wait for (default: 1)
 * @param provider - The ethers.js provider instance
 * @returns Promise resolving to the transaction receipt data
 *
 * @throws {Error} If the provider is not connected, transaction hash is invalid, or transaction fails
 *
 * @example
 * ```typescript
 * const receipt = await waitForConfirmationHandler('0x1234...abcd', 3, provider);
 * console.log(receipt.status); // 1 (success) or 0 (failure)
 * ```
 */
export async function waitForConfirmationHandler(
  txHash: string,
  confirmations: number,
  provider: JsonRpcProvider
): Promise<TransactionReceiptData> {
  // Get transaction response first
  const txResponse = await provider.getTransaction(txHash);

  if (!txResponse) {
    throw new Error(`Transaction not found: ${txHash}`);
  }

  // Wait for specified number of confirmations
  const receipt: TransactionReceipt | null = await txResponse.wait(
    confirmations
  );

  if (!receipt) {
    throw new Error(`Transaction receipt not available: ${txHash}`);
  }

  // Convert to our SDK receipt format
  return {
    hash: receipt.hash,
    status: receipt.status === null ? 0 : (receipt.status as 0 | 1),
    gasUsed: receipt.gasUsed.toString(),
    effectiveGasPrice: receipt.gasPrice?.toString() || "0",
    blockNumber: receipt.blockNumber,
    blockHash: receipt.blockHash,
    transactionIndex: receipt.index,
    logs: receipt.logs.map((log) => ({
      address: log.address,
      topics: [...log.topics], // Convert readonly array to mutable array
      data: log.data,
    })),
    ethersReceipt: receipt,
  };
}

/**
 * Get transaction receipt
 *
 * Retrieves the transaction receipt if the transaction has been mined.
 *
 * @param txHash - The transaction hash
 * @param provider - The ethers.js provider instance
 * @returns Promise resolving to the transaction receipt data, or null if not yet mined
 *
 * @throws {Error} If the provider is not connected or transaction hash is invalid
 *
 * @example
 * ```typescript
 * const receipt = await getTransactionReceiptHandler('0x1234...abcd', provider);
 * if (receipt) {
 *   console.log(receipt.gasUsed); // Gas used by transaction
 * }
 * ```
 */
export async function getTransactionReceiptHandler(
  txHash: string,
  provider: JsonRpcProvider
): Promise<TransactionReceiptData | null> {
  // Get transaction receipt
  const receipt = await provider.getTransactionReceipt(txHash);

  if (!receipt) {
    return null;
  }

  // Convert to our SDK receipt format
  return {
    hash: receipt.hash,
    status: receipt.status === null ? 0 : (receipt.status as 0 | 1),
    gasUsed: receipt.gasUsed.toString(),
    effectiveGasPrice: receipt.gasPrice?.toString() || "0",
    blockNumber: receipt.blockNumber,
    blockHash: receipt.blockHash,
    transactionIndex: receipt.index,
    logs: receipt.logs.map((log) => ({
      address: log.address,
      topics: [...log.topics], // Convert readonly array to mutable array
      data: log.data,
    })),
    ethersReceipt: receipt,
  };
}

/**
 * Poll transaction until confirmed
 *
 * Polls the blockchain at regular intervals until the transaction is confirmed
 * or a timeout is reached.
 *
 * @param txHash - The transaction hash
 * @param provider - The ethers.js provider instance
 * @param interval - Polling interval in milliseconds (default: 5000)
 * @param timeout - Maximum time to wait in milliseconds (default: 300000 = 5 minutes)
 * @returns Promise resolving to the transaction receipt data
 *
 * @throws {Error} If timeout is reached or transaction fails
 *
 * @example
 * ```typescript
 * const receipt = await pollTransactionHandler('0x1234...abcd', provider, 3000, 60000);
 * ```
 */
export async function pollTransactionHandler(
  txHash: string,
  provider: JsonRpcProvider,
  interval: number = 5000,
  timeout: number = 300000
): Promise<TransactionReceiptData> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const receipt = await getTransactionReceiptHandler(txHash, provider);

    if (receipt) {
      return receipt;
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`Transaction polling timeout: ${txHash}`);
}
