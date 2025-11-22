/**
 * Transaction Validation Schemas
 *
 * This file contains Zod schemas for validating transaction-related data:
 * - Transaction hash validation (Ethereum transaction hashes)
 * - Address validation (from, to)
 * - Amount validation (positive numbers, proper format)
 * - Gas parameter validation
 * - Network validation
 *
 * Used to ensure data integrity before transaction operations.
 */

import { z } from "zod/v4";
import { isAddress, isHexString } from "ethers";
import {
  WalletAddressSchema,
  NetworkSchema,
} from "@/resources/blockchain/wallets/wallets.validator";

import { NETWORKS } from "@/resources/blockchain/constants/networks";

/**
 * Validates Ethereum transaction hash format
 *
 * Transaction hashes are 66 characters (0x + 64 hex characters)
 * or 64 hex characters without 0x prefix
 *
 * @param txHash - The transaction hash string to validate
 * @returns true if valid transaction hash format, false otherwise
 */
const isValidTransactionHash = (txHash: string): boolean => {
  // Remove 0x prefix if present
  const cleaned = txHash.startsWith("0x") ? txHash.slice(2) : txHash;
  // Must be exactly 64 hex characters
  if (!/^[0-9a-fA-F]{64}$/.test(cleaned)) {
    return false;
  }
  // Also validate with ethers.js isHexString for additional safety
  return isHexString(txHash, 32); // 32 bytes = 64 hex characters
};

/**
 * Validates that a string represents a positive number
 *
 * @param amount - The amount string to validate
 * @returns true if valid positive number, false otherwise
 */
const isValidAmount = (amount: string): boolean => {
  // Must be a valid number
  const num = Number(amount);
  if (isNaN(num) || !isFinite(num)) {
    return false;
  }
  // Must be positive
  return num > 0;
};

/**
 * Validates network identifier
 *
 * @param network - The network string to validate
 * @returns true if valid network, false otherwise
 */
const isValidNetwork = (network: string): boolean => {
  return NETWORKS.includes(network as (typeof NETWORKS)[number]);
};

/**
 * Schema for validating Ethereum transaction hashes
 *
 * Transaction hashes must be 64 hex characters (optionally prefixed with 0x)
 *
 * @example
 * ```typescript
 * const txHash = TransactionHashSchema.parse('0x1234...abcd');
 * ```
 */
export const TransactionHashSchema = z
  .string()
  .min(1, "Transaction hash cannot be empty")
  .refine(isValidTransactionHash, {
    message:
      "Invalid transaction hash format. Must be 64 hex characters (optionally prefixed with 0x)",
  });

/**
 * Schema for validating token identifiers
 *
 * @example
 * ```typescript
 * const token = TokenSchema.parse('usdc');
 * ```
 */
export const TokenSchema = z.enum(["usdc", "usdt", "eurc"]);

export { NetworkSchema };

/**
 * Schema for validating transaction amounts
 *
 * Amounts must be positive numbers represented as strings
 *
 * @example
 * ```typescript
 * const amount = AmountSchema.parse('100.5');
 * ```
 */
export const AmountSchema = z
  .string()
  .min(1, "Amount cannot be empty")
  .refine(isValidAmount, {
    message: "Amount must be a positive number",
  });

/**
 * Schema for validating gas limit values
 *
 * Gas limits must be positive integers
 *
 * @example
 * ```typescript
 * const gasLimit = GasLimitSchema.parse('21000');
 * ```
 */
export const GasLimitSchema = z
  .string()
  .min(1, "Gas limit cannot be empty")
  .refine(
    (val) => {
      const num = Number(val);
      return !isNaN(num) && isFinite(num) && num > 0 && Number.isInteger(num);
    },
    {
      message: "Gas limit must be a positive integer",
    }
  );

/**
 * Schema for validating gas price values
 *
 * Gas prices must be positive numbers (can be decimals for gwei)
 *
 * @example
 * ```typescript
 * const gasPrice = GasPriceSchema.parse('20.5');
 * ```
 */
export const GasPriceSchema = z
  .string()
  .min(1, "Gas price cannot be empty")
  .refine(isValidAmount, {
    message: "Gas price must be a positive number",
  });

/**
 * Schema for validating transaction request data
 *
 * Used when sending native token transactions
 *
 * @example
 * ```typescript
 * const request = SendTransactionSchema.parse({
 *   to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
 *   amount: '1.5',
 *   network: 'polygon'
 * });
 * ```
 */
export const SendTransactionSchema = z.object({
  to: WalletAddressSchema,
  amount: AmountSchema,
  network: NetworkSchema,
  gasLimit: GasLimitSchema.optional(),
  gasPrice: GasPriceSchema.optional(),
});

/**
 * Schema for validating token transaction request data
 *
 * Used when sending ERC-20 token transactions
 *
 * @example
 * ```typescript
 * const request = SendTokenTransactionSchema.parse({
 *   token: 'usdc',
 *   to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
 *   amount: '100.0',
 *   network: 'polygon'
 * });
 * ```
 */
export const SendTokenTransactionSchema = z.object({
  token: TokenSchema,
  to: WalletAddressSchema,
  amount: AmountSchema,
  network: NetworkSchema,
  gasLimit: GasLimitSchema.optional(),
  gasPrice: GasPriceSchema.optional(),
});

/**
 * Schema for validating gas estimation requests
 *
 * @example
 * ```typescript
 * const request = GasEstimateRequestSchema.parse({
 *   from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
 *   to: '0x1234...abcd',
 *   amount: '1.0',
 *   network: 'polygon'
 * });
 * ```
 */
export const GasEstimateRequestSchema = z.object({
  from: WalletAddressSchema,
  to: WalletAddressSchema,
  amount: AmountSchema,
  network: NetworkSchema,
  data: z.string().optional(),
});

/**
 * Schema for validating transaction status requests
 *
 * @example
 * ```typescript
 * const request = TransactionStatusRequestSchema.parse({
 *   txHash: '0x1234...abcd',
 *   network: 'polygon'
 * });
 * ```
 */
export const TransactionStatusRequestSchema = z.object({
  txHash: TransactionHashSchema,
  network: NetworkSchema,
});

/**
 * Schema for validating transaction options
 *
 * Optional parameters for customizing transactions
 *
 * @example
 * ```typescript
 * const options = TransactionOptionsSchema.parse({
 *   gasLimit: '21000',
 *   gasPrice: '20.5'
 * });
 * ```
 */
export const TransactionOptionsSchema = z.object({
  gasLimit: GasLimitSchema.optional(),
  gasPrice: GasPriceSchema.optional(),
  nonce: z.number().int().positive().optional(),
  value: z.string().optional(),
  data: z.string().optional(),
});
