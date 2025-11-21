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
 * Format wei value to ether string.
 *
 * @param amount - Amount in wei (string or bigint)
 * @returns Formatted ether string
 */
export function formatEther(amount: string | bigint): string {
  return ethersFormatEther(amount);
}

/**
 * Parse ether string to wei string.
 *
 * @param amount - Amount in ether string
 * @returns Amount in wei as string
 */
export function parseEther(amount: string): string {
  return ethersParseEther(amount).toString();
}

/**
 * Format wei value to gwei string.
 *
 * @param amount - Amount in wei (string or bigint)
 * @returns Formatted gwei string
 */
export function formatGwei(amount: string | bigint): string {
  return formatUnits(amount, 9);
}

/**
 * Parse gwei string to wei string.
 *
 * @param amount - Amount in gwei string
 * @returns Amount in wei as string
 */
export function parseGwei(amount: string): string {
  return parseUnits(amount, 9).toString();
}

/**
 * Format transaction hash for display (e.g., 0x1234...abcd).
 *
 * @param txHash - Transaction hash to format
 * @param visibleChars - Number of characters to show from start and end (default: 6)
 * @returns Formatted transaction hash
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
