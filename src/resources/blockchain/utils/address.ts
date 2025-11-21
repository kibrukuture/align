/**
 * Address Utility Functions
 *
 * This file contains utility functions for working with blockchain addresses:
 * - Validate Ethereum-style addresses
 * - Format addresses (checksum, short format)
 * - Convert between address formats
 * - Address validation for different networks
 *
 * Essential for input validation and address formatting in UI.
 */

import { getAddress, isAddress, ZeroAddress } from "ethers";

/**
 * Validate Ethereum-style address format.
 *
 * @param address - The address string to validate
 * @returns True if the address is valid, false otherwise
 */
export function isValidAddress(address: string): boolean {
  return isAddress(address);
}

/**
 * Convert address to EIP-55 checksum format.
 *
 * @param address - The address to convert
 * @returns Checksum address
 * @throws {Error} If address is invalid
 */
export function toChecksumAddress(address: string): string {
  return getAddress(address);
}

/**
 * Format address for display (e.g., 0x1234...abcd).
 *
 * @param address - The address to format
 * @param visibleChars - Number of characters to show from start and end (default: 6)
 * @returns Formatted address string
 */
export function formatAddress(
  address: string,
  visibleChars: number = 6
): string {
  if (!isValidAddress(address)) {
    throw new Error("Invalid address");
  }

  const checksum = toChecksumAddress(address);
  const prefix = checksum.slice(0, visibleChars + 2); // include 0x
  const suffix = checksum.slice(-visibleChars);
  return `${prefix}...${suffix}`;
}

/**
 * Check if address is the zero address.
 *
 * @param address - The address to check
 * @returns True if zero address, false otherwise
 */
export function isZeroAddress(address: string): boolean {
  try {
    return toChecksumAddress(address) === ZeroAddress;
  } catch {
    return false;
  }
}
