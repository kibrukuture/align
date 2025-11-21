/**
 * Formatting Utility Functions
 *
 * This file contains utility functions for formatting blockchain values:
 * - Format native token amounts (wei -> ether, etc.)
 * - Parse human-readable amounts to blockchain format
 * - Format transaction hashes
 * - Format gas prices and limits
 *
 * Critical for displaying user-friendly values and converting user input.
 */

import {
  formatEther as ethersFormatEther,
  parseEther as ethersParseEther,
} from "ethers";
import { formatUnits, parseUnits } from "ethers";

/**
 * Converts a value from Wei to Ether (or native token unit)
 *
 * Used for displaying balances and amounts to users.
 * 1 Ether = 10^18 Wei.
 *
 * @param {string | bigint} amount - Amount in Wei
 * @returns {string} Formatted string (e.g., "1.5")
 *
 * @example
 * ```typescript
 * const balanceWei = "1500000000000000000";
 * const balanceEth = formatEther(balanceWei); // "1.5"
 * ```
 */
export function formatEther(amount: string | bigint): string {
  return ethersFormatEther(amount);
}

/**
 * Converts a value from Ether (or native token unit) to Wei
 *
 * Used for preparing transaction amounts from user input.
 *
 * @param {string} amount - Amount in Ether (e.g., "1.5")
 * @returns {string} Amount in Wei as a string
 *
 * @example
 * ```typescript
 * const amountWei = parseEther("1.5"); // "1500000000000000000"
 * ```
 */
export function parseEther(amount: string): string {
  return ethersParseEther(amount).toString();
}

/**
 * Converts a value from Wei to Gwei
 *
 * Used primarily for displaying gas prices.
 * 1 Gwei = 10^9 Wei.
 *
 * @param {string | bigint} amount - Amount in Wei
 * @returns {string} Formatted string (e.g., "20.5")
 *
 * @example
 * ```typescript
 * const gasPriceWei = "20500000000";
 * const gasPriceGwei = formatGwei(gasPriceWei); // "20.5"
 * ```
 */
export function formatGwei(amount: string | bigint): string {
  return formatUnits(amount, 9);
}

/**
 * Converts a value from Gwei to Wei
 *
 * Used for setting gas prices from user input (e.g., "I want to pay 50 Gwei").
 *
 * @param {string} amount - Amount in Gwei (e.g., "50")
 * @returns {string} Amount in Wei as a string
 *
 * @example
 * ```typescript
 * const gasPriceWei = parseGwei("50"); // "50000000000"
 * ```
 */
export function parseGwei(amount: string): string {
  return parseUnits(amount, 9).toString();
}

/**
 * Formats a transaction hash for display by truncating the middle
 *
 * Similar to address formatting but specifically for 66-character tx hashes.
 *
 * @param {string} txHash - The transaction hash to format
 * @param {number} [visibleChars=6] - Number of characters to show at start/end
 * @returns {string} Formatted string (e.g., "0x1234...abcd")
 *
 * @example
 * ```typescript
 * const hash = "0x5d43971384932849839248239482394823948239482394823948239482394823";
 * console.log(formatTransactionHash(hash)); // "0x5d4397...394823"
 * ```
 */
export function formatTransactionHash(
  txHash: string,
  visibleChars: number = 6
): string {
  if (!txHash.startsWith("0x") || txHash.length < visibleChars * 2 + 4) {
    return txHash;
  }

  const prefix = txHash.slice(0, visibleChars + 2); // include 0x
  const suffix = txHash.slice(-visibleChars);
  return `${prefix}...${suffix}`;
}
