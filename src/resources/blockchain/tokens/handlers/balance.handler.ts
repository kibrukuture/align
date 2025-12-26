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
 * Queries the blockchain for the native token balance (ETH, POL, etc.)
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
 * console.log(balance); // "1.5" (in POL)
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
 * Retrieves balances for multiple ERC-20 tokens in a single efficient call
 *
 * Queries multiple token contracts in parallel to get balances for all specified tokens.
 * This is much more efficient than calling getTokenBalance multiple times sequentially.
 *
 * Each balance includes the token information (symbol, name, decimals) along with both
 * raw and formatted balance values.
 *
 * **Performance Benefits:**
 * - Parallel queries (all tokens fetched simultaneously)
 * - Single function call for multiple balances
 * - Includes token metadata in response
 *
 * **Use Cases:**
 * - Portfolio displays showing all token holdings
 * - Balance checks before multi-token operations
 * - Wallet dashboards with multiple assets
 *
 * @param {string} address - The wallet address to query
 *   Must be a valid Ethereum-style address
 *
 * @param {string[]} tokenAddresses - Array of ERC-20 token contract addresses
 *   Example: ["0x2791...", "0xc213...", "0x8f3C..."]
 *   Each must be a valid contract address on the specified network
 *
 * @param {JsonRpcProvider} provider - Connected ethers.js JSON-RPC provider
 *   Must be connected to the network where tokens exist
 *
 * @param {Network} network - The blockchain network identifier
 *   Example: "polygon", "ethereum", "base", "arbitrum"
 *
 * @returns {Promise<TokenBalance[]>} A promise that resolves to an array of token balances
 *   Each balance object contains:
 *   - `token` (string): Token symbol (e.g., "USDC")
 *   - `address` (string): Token contract address
 *   - `balance` (string): Raw balance in smallest unit
 *   - `balanceFormatted` (string): Human-readable balance
 *   - `decimals` (number): Token decimal places
 *   - `network` (Network): Network identifier
 *
 * @throws {Error} If:
 *   - Provider is not connected
 *   - Address is invalid
 *   - Any token contract address is invalid
 *   - Token contract doesn't implement required ERC-20 functions
 *   - Network RPC error
 *
 * @example
 * Getting balances for multiple stablecoins on Polygon
 * ```typescript
 * const provider = new JsonRpcProvider("https://polygon-rpc.com");
 * const stablecoins = [
 *   "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC
 *   "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", // USDT
 *   "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", // DAI
 * ];
 *
 * const balances = await getTokenBalances(
 *   "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
 *   stablecoins,
 *   provider,
 *   "polygon"
 * );
 *
 * balances.forEach(b => {
 *   console.log(`${b.token}: ${b.balanceFormatted}`);
 * });
 * // Output:
 * // USDC: 100.0
 * // USDT: 50.5
 * // DAI: 25.75
 * ```
 *
 * @example
 * Building a portfolio display
 * ```typescript
 * async function getPortfolio(walletAddress: string) {
 *   const tokens = [
 *     "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC
 *     "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", // USDT
 *   ];
 *
 *   const balances = await getTokenBalances(
 *     walletAddress,
 *     tokens,
 *     provider,
 *     "polygon"
 *   );
 *
 *   // Filter out zero balances
 *   const nonZeroBalances = balances.filter(b =>
 *     parseFloat(b.balanceFormatted) > 0
 *   );
 *
 *   return nonZeroBalances.map(b => ({
 *     symbol: b.token,
 *     balance: b.balanceFormatted,
 *     network: b.network,
 *   }));
 * }
 * ```
 *
 * @example
 * Calculating total value in USD
 * ```typescript
 * const balances = await getTokenBalances(address, tokenAddresses, provider, "polygon");
 *
 * // Assume you have price data
 * const prices = { USDC: 1.0, USDT: 1.0, DAI: 1.0 };
 *
 * const totalValue = balances.reduce((sum, b) => {
 *   const value = parseFloat(b.balanceFormatted) * prices[b.token];
 *   return sum + value;
 * }, 0);
 *
 * console.log(`Total portfolio value: $${totalValue.toFixed(2)}`);
 * ```
 *
 * @see {@link getTokenBalance} To get a single token balance
 * @see {@link getNativeBalance} To get native token balance
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
    const tokenInfo = await getTokenInfo(tokenAddress, provider, network);

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
 * Formats a raw token balance to human-readable format
 *
 * Converts a balance from its smallest unit (like wei for ETH) to a decimal format
 * that's easy for humans to read. This utility function handles the decimal conversion
 * based on the token's decimal places.
 *
 * **Common Token Decimals:**
 * - Most tokens: 18 decimals (ETH, DAI, LINK)
 * - Stablecoins: 6 decimals (USDC, USDT)
 * - Bitcoin-pegged: 8 decimals (WBTC)
 *
 * @param {string} balance - The raw balance as a string in smallest unit
 *   Example: "1000000" (for USDC with 6 decimals = 1.0 USDC)
 *   Example: "1500000000000000000" (for ETH with 18 decimals = 1.5 ETH)
 *
 * @param {number} decimals - The number of decimal places for the token
 *   Typically 6, 8, or 18 depending on the token
 *
 * @returns {string} The formatted balance as a human-readable string
 *   Example: "1.0" or "1.5" or "100.25"
 *
 * @example
 * Formatting USDC balance (6 decimals)
 * ```typescript
 * const rawBalance = "1000000"; // 1 USDC in smallest unit
 * const formatted = formatBalance(rawBalance, 6);
 * console.log(formatted); // "1.0"
 * ```
 *
 * @example
 * Formatting ETH balance (18 decimals)
 * ```typescript
 * const rawBalance = "1500000000000000000"; // 1.5 ETH in wei
 * const formatted = formatBalance(rawBalance, 18);
 * console.log(formatted); // "1.5"
 * ```
 *
 * @example
 * Formatting for display
 * ```typescript
 * const rawBalance = "123456789"; // USDC
 * const formatted = formatBalance(rawBalance, 6);
 * const display = parseFloat(formatted).toFixed(2);
 * console.log(`Balance: $${display}`);
 * // Output: Balance: $123.46
 * ```
 *
 * @example
 * Handling different token types
 * ```typescript
 * const tokens = [
 *   { raw: "1000000", decimals: 6, symbol: "USDC" },
 *   { raw: "1000000000000000000", decimals: 18, symbol: "DAI" },
 *   { raw: "100000000", decimals: 8, symbol: "WBTC" },
 * ];
 *
 * tokens.forEach(t => {
 *   const formatted = formatBalance(t.raw, t.decimals);
 *   console.log(`${t.symbol}: ${formatted}`);
 * });
 * // Output:
 * // USDC: 1.0
 * // DAI: 1.0
 * // WBTC: 1.0
 * ```
 */
export function formatBalance(balance: string, decimals: number): string {
  return formatUnits(balance, decimals);
}
