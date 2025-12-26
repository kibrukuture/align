/**
 * Transaction Type Definitions
 *
 * This file contains all TypeScript interfaces and types related to transactions:
 * - Transaction object structure
 * - Transaction status types
 * - Transaction receipt structure
 * - Gas estimation results
 *
 * These types ensure type safety across all transaction operations.
 */

import type { TransactionResponse, TransactionReceipt } from "ethers";
import type { Network } from "@/resources/blockchain/constants/networks";
import type { Token } from "@/resources/blockchain/wallets/wallets.types";

/**
 * Transaction status during lifecycle
 *
 * @example
 * ```typescript
 * const status: TransactionStatus = 'pending';
 * ```
 */
export type TransactionStatus = "pending" | "confirmed" | "failed" | "replaced";

/**
 * Transaction object returned after sending a transaction
 *
 * Extends ethers.js TransactionResponse with additional metadata
 *
 * @example
 * ```typescript
 * const tx: Transaction = {
 *   hash: '0x1234...abcd',
 *   from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
 *   to: '0x1234...abcd',
 *   value: '1000000000000000000',
 *   status: 'pending',
 *   network: 'polygon'
 * };
 * ```
 */
export interface Transaction {
  /**
   * Transaction hash (32 bytes, 64 hex characters)
   */
  hash: string;

  /**
   * Sender address
   */
  from: string;

  /**
   * Recipient address (null for contract creation)
   */
  to: string | null;

  /**
   * Transaction value in wei (as string to handle large numbers)
   */
  value: string;

  /**
   * Transaction status
   */
  status: TransactionStatus;

  /**
   * Network where transaction was sent
   */
  network: Network;

  /**
   * Gas limit used
   */
  gasLimit: string;

  /**
   * Gas price used (in wei)
   */
  gasPrice: string;

  /**
   * Transaction nonce
   */
  nonce: number;

  /**
   * Block number where transaction was included (null if pending)
   */
  blockNumber: number | null;

  /**
   * Block hash where transaction was included (null if pending)
   */
  blockHash: string | null;

  /**
   * Number of confirmations
   */
  confirmations: number;

  /**
   * Timestamp when transaction was sent
   */
  timestamp: number;

  /**
   * Transaction data (for contract calls)
   */
  data: string;

  /**
   * The underlying ethers.js TransactionResponse
   * (for advanced use cases)
   */
  ethersTx?: TransactionResponse;
}

/**
 * Transaction receipt after confirmation
 *
 * Extends ethers.js TransactionReceipt with additional metadata
 *
 * @example
 * ```typescript
 * const receipt: TransactionReceipt = {
 *   hash: '0x1234...abcd',
 *   status: 1,
 *   gasUsed: '21000',
 *   effectiveGasPrice: '20000000000',
 *   // ... other fields
 * };
 * ```
 */
export interface TransactionReceiptData {
  /**
   * Transaction hash
   */
  hash: string;

  /**
   * Transaction status (1 = success, 0 = failure)
   */
  status: 0 | 1;

  /**
   * Gas used by the transaction
   */
  gasUsed: string;

  /**
   * Effective gas price paid
   */
  effectiveGasPrice: string;

  /**
   * Block number
   */
  blockNumber: number;

  /**
   * Block hash
   */
  blockHash: string;

  /**
   * Transaction index in block
   */
  transactionIndex: number;

  /**
   * Logs emitted by the transaction
   */
  logs: Array<{
    address: string;
    topics: string[];
    data: string;
  }>;

  /**
   * The underlying ethers.js TransactionReceipt
   * (for advanced use cases)
   */
  ethersReceipt?: TransactionReceipt;
}

/**
 * Gas estimation result
 *
 * Contains estimated gas limit and current gas price
 *
 * @example
 * ```typescript
 * const estimate: GasEstimate = {
 *   gasLimit: '21000',
 *   gasPrice: '20000000000',
 *   totalCost: '420000000000000'
 * };
 * ```
 */
export interface GasEstimate {
  /**
   * Estimated gas limit needed for the transaction
   */
  gasLimit: string;

  /**
   * Current gas price in wei
   */
  gasPrice: string;

  /**
   * Total estimated cost (gasLimit * gasPrice) in wei
   */
  totalCost: string;

  /**
   * Total estimated cost formatted in native token (e.g., ETH, POL)
   */
  totalCostFormatted: string;
}

/**
 * Transaction request parameters
 *
 * Used when sending native token transactions
 *
 * @example
 * ```typescript
 * const request: SendTransactionRequest = {
 *   to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
 *   amount: '1.5',
 *   network: 'polygon'
 * };
 * ```
 */
export interface SendTransactionRequest {
  /**
   * Recipient address
   */
  to: string;

  /**
   * Amount to send (as string to handle decimals)
   */
  amount: string;

  /**
   * Network to send on
   */
  network: Network;

  /**
   * Optional gas limit (if not provided, will be estimated)
   */
  gasLimit?: string;

  /**
   * Optional gas price (if not provided, will use current network gas price)
   */
  gasPrice?: string;

  /**
   * Optional transaction data (for contract calls)
   */
  data?: string;
}

/**
 * Token transaction request parameters
 *
 * Used when sending ERC-20 token transactions
 *
 * @example
 * ```typescript
 * const request: SendTokenTransactionRequest = {
 *   token: 'usdc',
 *   to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
 *   amount: '100.0',
 *   network: 'polygon'
 * };
 * ```
 */
export interface SendTokenTransactionRequest {
  /**
   * Token identifier
   */
  token: Token;

  /**
   * Recipient address
   */
  to: string;

  /**
   * Amount to send (as string to handle decimals)
   */
  amount: string;

  /**
   * Network to send on
   */
  network: Network;

  /**
   * Optional gas limit (if not provided, will be estimated)
   */
  gasLimit?: string;

  /**
   * Optional gas price (if not provided, will use current network gas price)
   */
  gasPrice?: string;
}

/**
 * Transaction options for customizing transactions
 *
 * @example
 * ```typescript
 * const options: TransactionOptions = {
 *   gasLimit: '21000',
 *   gasPrice: '20000000000',
 *   nonce: 5
 * };
 * ```
 */
export interface TransactionOptions {
  /**
   * Gas limit for the transaction
   */
  gasLimit?: string;

  /**
   * Gas price in wei
   */
  gasPrice?: string;

  /**
   * Transaction nonce (if not provided, will use current nonce)
   */
  nonce?: number;

  /**
   * Transaction value in wei (for native token transfers)
   */
  value?: string;

  /**
   * Transaction data (for contract calls)
   */
  data?: string;
}

/**
 * Transaction status request parameters
 *
 * @example
 * ```typescript
 * const request: TransactionStatusRequest = {
 *   txHash: '0x1234...abcd',
 *   network: 'polygon'
 * };
 * ```
 */
export interface TransactionStatusRequest {
  /**
   * Transaction hash
   */
  txHash: string;

  /**
   * Network where transaction was sent
   */
  network: Network;
}
