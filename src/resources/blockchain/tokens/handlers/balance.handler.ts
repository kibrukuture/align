/**
 * Token Balance Handler
 *
 * This file contains the complex business logic for retrieving token balances.
 * Uses ethers.js to query ERC-20 token contracts and native token balances.
 *
 * Handles:
 * - ERC-20 token balance queries
 * - Native token balance queries
 * - Batch balance queries (multiple tokens)
 * - Balance formatting with decimals
 *
 * All token balance query logic is isolated here.
 */

import { formatUnits, parseUnits } from "ethers";
import type { JsonRpcProvider } from "ethers";
import type { TokenBalance } from "@/resources/blockchain/tokens/tokens.types";
import type { Network } from "@/resources/blockchain/wallets/wallets.types";
import { getTokenBalance as walletGetTokenBalance } from "@/resources/blockchain/wallets/handlers/get.handler";
import { getBalance as walletGetBalance } from "@/resources/blockchain/wallets/handlers/get.handler";
import { getTokenInfo } from "@/resources/blockchain/tokens/handlers/info.handler";

/**
 * Get ERC-20 token balance for an address
 *
 * Queries the ERC-20 token contract for the balance of a given address.
 *
 * @param address - The wallet address to query
 * @param tokenAddress - The ERC-20 token contract address
 * @param provider - The ethers.js provider instance
 * @returns Promise resolving to the balance as a string (formatted with token decimals)
 *
 * @throws {Error} If the provider is not connected, address is invalid, or token contract is invalid
 *
 * @example
 * ```typescript
 * const balance = await getTokenBalance(
 *   '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
 *   '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC on Polygon
 *   provider
 * );
 * console.log(balance); // "100.0" (in USDC)
 * ```
 */
export async function getTokenBalance(
  address: string,
  tokenAddress: string,
  provider: JsonRpcProvider
): Promise<string> {
  // Delegate to wallet handler
  return walletGetTokenBalance(address, tokenAddress, provider);
}

/**
 * Get native token balance for an address
 *
 * Queries the blockchain for the native token balance (ETH, MATIC, etc.)
 * of a given address.
 *
 * @param address - The wallet address to query
 * @param provider - The ethers.js provider instance
 * @returns Promise resolving to the balance as a string (formatted with decimals)
 *
 * @throws {Error} If the provider is not connected or address is invalid
 *
 * @example
 * ```typescript
 * const balance = await getNativeBalance(
 *   '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
 *   provider
 * );
 * console.log(balance); // "1.5" (in MATIC)
 * ```
 */
export async function getNativeBalance(
  address: string,
  provider: JsonRpcProvider
): Promise<string> {
  // Delegate to wallet handler
  return walletGetBalance(address, provider);
}

/**
 * Get multiple token balances in one call
 *
 * Queries balances for multiple tokens in parallel for efficiency.
 *
 * @param address - The wallet address to query
 * @param tokenAddresses - Array of ERC-20 token contract addresses
 * @param provider - The ethers.js provider instance
 * @returns Promise resolving to an array of token balances
 *
 * @throws {Error} If the provider is not connected, address is invalid, or any token contract is invalid
 *
 * @example
 * ```typescript
 * const balances = await getTokenBalances(
 *   '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
 *   ['0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'],
 *   provider
 * );
 * ```
 */
export async function getTokenBalances(
  address: string,
  tokenAddresses: string[],
  provider: JsonRpcProvider,
  network: Network
): Promise<TokenBalance[]> {
  // Query all balances in parallel
  const balancePromises = tokenAddresses.map(async (tokenAddress) => {
    const balanceFormatted = await getTokenBalance(
      address,
      tokenAddress,
      provider
    );

    // Get token info to include in result
    const tokenInfo = await getTokenInfo(
      tokenAddress,
      provider,
      network
    );

    const rawBalance = parseUnits(
      balanceFormatted,
      tokenInfo.decimals
    ).toString();

    return {
      token: tokenInfo.token,
      address: tokenAddress,
      balance: rawBalance,
      balanceFormatted,
      decimals: tokenInfo.decimals,
      network: tokenInfo.network,
    };
  });

  return Promise.all(balancePromises);
}

/**
 * Format token balance with decimals
 *
 * Formats a raw balance (in wei/smallest unit) to human-readable format.
 *
 * @param balance - The raw balance as a string (in smallest unit)
 * @param decimals - The number of decimals for the token
 * @returns Formatted balance as a string
 *
 * @example
 * ```typescript
 * const formatted = formatBalance('1000000', 6);
 * console.log(formatted); // "1.0" (for USDC with 6 decimals)
 * ```
 */
export function formatBalance(
  balance: string,
  decimals: number
): string {
  return formatUnits(balance, decimals);
}
