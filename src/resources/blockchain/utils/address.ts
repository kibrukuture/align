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
 * Validates if a string is a valid Ethereum-style address
 *
 * Checks for:
 * - Correct length (42 characters)
 * - '0x' prefix
 * - Hexadecimal characters
 * - Checksum validity (if mixed case)
 *
 * @param {string} address - The address string to validate
 * @returns {boolean} True if the address is valid, false otherwise
 *
 * @example
 * ```typescript
 * if (isValidAddress("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb")) {
 *   console.log("Valid address");
 * }
 * ```
 */
export function isValidAddress(address: string): boolean {
  return isAddress(address);
}

/**
 * Converts an address to EIP-55 checksum format
 *
 * Ensures the address has the correct capitalization (checksum) to prevent
 * typing errors.
 *
 * @param {string} address - The address to convert
 * @returns {string} Checksummed address (e.g., "0xAbCd...")
 * @throws {Error} If address is invalid
 *
 * @example
 * ```typescript
 * const checksum = toChecksumAddress("0x742d35cc6634c0532925a3b844bc9e7595f0beb");
 * // Returns "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
 * ```
 */
export function toChecksumAddress(address: string): string {
  return getAddress(address);
}

/**
 * Formats an address for display by truncating the middle
 *
 * Useful for UI display where full addresses take up too much space.
 * Always returns the checksummed version.
 *
 * @param {string} address - The address to format
 * @param {number} [visibleChars=6] - Number of characters to show at start/end
 * @returns {string} Formatted string (e.g., "0x1234...abcd")
 * @throws {Error} If address is invalid
 *
 * @example
 * ```typescript
 * console.log(formatAddress("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"));
 * // Output: "0x742d35...f0bEb"
 * ```
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
 * Checks if an address is the Zero Address (0x000...000)
 *
 * The zero address is often used to represent:
 * - Native token (in some contexts)
 * - Burn address
 * - Uninitialized address
 *
 * @param {string} address - The address to check
 * @returns {boolean} True if it is the zero address
 *
 * @example
 * ```typescript
 * if (isZeroAddress(address)) {
 *   console.log("This is the zero address");
 * }
 * ```
 */
export function isZeroAddress(address: string): boolean {
  try {
    return toChecksumAddress(address) === ZeroAddress;
  } catch {
    return false;
  }
}
