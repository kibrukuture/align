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
} from "@/resources/blockchain/transactions/transactions.types";

/**
 * Retrieves the current status of a transaction on the blockchain
 *
 * Checks if a transaction is pending, confirmed, or failed by looking up its receipt.
 * This is a lightweight check that doesn't wait for confirmations.
 *
 * **Status Meanings:**
 * - `pending`: Transaction broadcasted but not yet mined (no receipt)
 * - `confirmed`: Transaction mined successfully (receipt status = 1)
 * - `failed`: Transaction mined but execution reverted (receipt status = 0)
 *
 * @param {string} txHash - The transaction hash to check
 *   Example: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
 *
 * @param {JsonRpcProvider} provider - Connected ethers.js JSON-RPC provider
 *   Must be connected to the network where the transaction was sent
 *
 * @returns {Promise<TransactionStatus>} A promise that resolves to the status:
 *   "pending" | "confirmed" | "failed"
 *
 * @throws {Error} If:
 *   - Provider is not connected
 *   - Network RPC error
 *
 * @example
 * Checking status
 * ```typescript
 * const status = await getTransactionStatus(
 *   "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
 *   provider
 * );
 * 
 * if (status === "confirmed") {
 *   console.log("Transaction successful!");
 * } else if (status === "failed") {
 *   console.log("Transaction failed on-chain");
 * } else {
 *   console.log("Still pending...");
 * }
 * ```
 *
 * @example
 * Polling status manually
 * ```typescript
 * async function checkUntilDone(txHash: string, provider: JsonRpcProvider) {
 *   let status = await getTransactionStatus(txHash, provider);
 *   
 *   while (status === "pending") {
 *     await new Promise(r => setTimeout(r, 2000)); // Wait 2s
 *     status = await getTransactionStatus(txHash, provider);
 *   }
 *   
 *   return status;
 * }
 * ```
 */
export async function getTransactionStatus(
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
 * Waits for a transaction to be mined and confirmed
 *
 * Blocks execution until the transaction has reached the specified number of confirmations.
 * This is the standard way to ensure a transaction is final and irreversible.
 *
 * **Confirmation Recommendations:**
 * - 1 confirmation: Good for small amounts / UX (fastest)
 * - 3-5 confirmations: Recommended for standard value transfers
 * - 12+ confirmations: Recommended for high value transfers (maximum security)
 *
 * @param {string} txHash - The transaction hash to wait for
 *
 * @param {number} confirmations - Number of blocks to wait (default: 1)
 *   Higher numbers = more security but slower
 *
 * @param {JsonRpcProvider} provider - Connected ethers.js JSON-RPC provider
 *
 * @returns {Promise<TransactionReceiptData>} A promise that resolves to the full receipt
 *   Contains status, gas used, logs, block number, etc.
 *
 * @throws {Error} If:
 *   - Transaction is not found in mempool
 *   - Transaction is dropped/replaced
 *   - Timeout (ethers.js default timeout)
 *   - Network error
 *
 * @example
 * Waiting for 1 confirmation (fast)
 * ```typescript
 * const receipt = await waitForConfirmation(txHash, 1, provider);
 * console.log(`Mined in block ${receipt.blockNumber}`);
 * ```
 *
 * @example
 * Waiting for high security (Polygon reorg protection)
 * ```typescript
 * console.log("Waiting for finality...");
 * const receipt = await waitForConfirmation(txHash, 128, provider);
 * console.log("Transaction is now irreversible");
 * ```
 *
 * @example
 * Handling wait errors
 * ```typescript
 * try {
 *   const receipt = await waitForConfirmation(txHash, 1, provider);
 *   
 *   if (receipt.status === 1) {
 *     console.log("Success!");
 *   } else {
 *     console.error("Transaction reverted!");
 *   }
 * } catch (error) {
 *   console.error("Transaction dropped or timed out:", error.message);
 * }
 * ```
 */
export async function waitForConfirmation(
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
 * Retrieves the receipt for a mined transaction
 *
 * Fetches the receipt which contains the result of the transaction execution,
 * including gas used, logs emitted, and final status (success/fail).
 *
 * Returns `null` if the transaction is still pending (not yet mined).
 *
 * @param {string} txHash - The transaction hash
 *
 * @param {JsonRpcProvider} provider - Connected ethers.js JSON-RPC provider
 *
 * @returns {Promise<TransactionReceiptData | null>} A promise that resolves to:
 *   - The receipt object if mined
 *   - `null` if pending or not found
 *
 * @throws {Error} If provider is not connected
 *
 * @example
 * Checking gas usage
 * ```typescript
 * const receipt = await getTransactionReceipt(txHash, provider);
 * 
 * if (receipt) {
 *   console.log(`Gas Used: ${receipt.gasUsed}`);
 *   console.log(`Effective Gas Price: ${receipt.effectiveGasPrice}`);
 * } else {
 *   console.log("Transaction still pending...");
 * }
 * ```
 *
 * @example
 * Reading event logs
 * ```typescript
 * const receipt = await getTransactionReceipt(txHash, provider);
 * 
 * if (receipt && receipt.logs.length > 0) {
 *   console.log("Transaction emitted events:", receipt.logs);
 * }
 * ```
 */
export async function getTransactionReceipt(
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
 * Polls for transaction confirmation with custom timeout and interval
 *
 * Repeatedly checks the transaction status at a set interval until it is mined
 * or the timeout is reached. This is useful when you want more control than
 * `waitForConfirmation` provides, or need to handle long-running transactions.
 *
 * **Why use polling?**
 * - Custom timeout handling (fail fast or wait long)
 * - Custom interval (reduce RPC load)
 * - Ability to implement progress UI
 *
 * @param {string} txHash - The transaction hash to monitor
 *
 * @param {JsonRpcProvider} provider - Connected ethers.js JSON-RPC provider
 *
 * @param {number} [interval=5000] - Polling interval in milliseconds (default: 5s)
 *
 * @param {number} [timeout=300000] - Maximum wait time in milliseconds (default: 5m)
 *
 * @returns {Promise<TransactionReceiptData>} A promise that resolves to the receipt
 *
 * @throws {Error} If:
 *   - Timeout is reached ("Transaction polling timeout")
 *   - Network error
 *
 * @example
 * Custom polling (check every 2s, timeout after 30s)
 * ```typescript
 * try {
 *   const receipt = await pollTransaction(
 *     txHash,
 *     provider,
 *     2000,  // 2s interval
 *     30000  // 30s timeout
 *   );
 *   console.log("Confirmed!");
 * } catch (error) {
 *   console.error("Transaction took too long");
 * }
 * ```
 *
 * @example
 * Long-running transaction (wait up to 10 mins)
 * ```typescript
 * const receipt = await pollTransaction(
 *   txHash,
 *   provider,
 *   10000,      // Check every 10s
 *   10 * 60000  // 10 min timeout
 * );
 * ```
 */
export async function pollTransaction(
  txHash: string,
  provider: JsonRpcProvider,
  interval: number = 5000,
  timeout: number = 300000
): Promise<TransactionReceiptData> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const receipt = await getTransactionReceipt(txHash, provider);

    if (receipt) {
      return receipt;
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`Transaction polling timeout: ${txHash}`);
}
