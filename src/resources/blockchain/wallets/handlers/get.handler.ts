/**
 * Wallet Information Retrieval Handler
 *
 * This file contains the complex business logic for retrieving wallet information.
 * Uses ethers.js and RPC providers to query blockchain data.
 *
 * Handles:
 * - Native token balance queries
 * - ERC-20 token balance queries
 * - Transaction history retrieval
 * - Wallet address validation
 *
 * All blockchain query logic is isolated here.
 */

import type { JsonRpcProvider } from "ethers";
import { Contract, formatUnits } from "ethers";
import type { Wallet as SDKWallet } from "@/resources/blockchain/wallets/wallets.types";

/**
 * Get wallet address from wallet object
 *
 * Extracts the address from a wallet object.
 *
 * @param wallet - The wallet object
 * @returns The wallet address
 *
 * @example
 * ```typescript
 * const address = getAddressFromWallet(wallet);
 * console.log(address); // "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
 * ```
 */
export function getAddressFromWallet(wallet: SDKWallet): string {
  return wallet.address;
}

/**
 * Get native token balance for an address
 *
 * Queries the blockchain for the native token balance (ETH, MATIC, etc.)
 * of a given address.
 *
 * @param address - The wallet address to query
 * @param network - The network identifier
 * @param provider - The ethers.js provider instance
 * @returns Promise resolving to the balance as a string (formatted with decimals)
 *
 * @throws {Error} If the provider is not connected or address is invalid
 *
 * @example
 * ```typescript
 * const balance = await getBalance(
 *   '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
 *   provider
 * );
 * console.log(balance); // "1.5" (in MATIC)
 * ```
 */
export async function getBalance(
  address: string,
  provider: JsonRpcProvider
): Promise<string> {
  // Get balance from provider (returns BigInt in wei)
  const balanceWei = await provider.getBalance(address);

  // Format balance with 18 decimals (standard for native tokens)
  // This will be formatted as human-readable (e.g., "1.5" instead of "1500000000000000000")
  return formatUnits(balanceWei, 18);
}

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
  // ERC-20 token standard ABI for balanceOf and decimals functions
  const erc20Abi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
  ];

  // Create contract instance
  const tokenContract = new Contract(tokenAddress, erc20Abi, provider);

  // Get balance and decimals in parallel
  const balanceOfFunction = tokenContract.getFunction("balanceOf");
  const decimalsFunction = tokenContract.getFunction("decimals");

  if (!balanceOfFunction || !decimalsFunction) {
    throw new Error(
      "Token contract does not implement required ERC-20 functions"
    );
  }

  const [balanceWei, decimals] = await Promise.all([
    balanceOfFunction(address),
    decimalsFunction(),
  ]);

  // Format balance with token decimals
  return formatUnits(balanceWei, decimals);
}

/**
 * Get transaction history for an address
 *
 * Retrieves recent transactions for a given address.
 * Note: This is a simplified implementation. For production, consider using
 * a block explorer API or indexing service for better performance.
 *
 * @param address - The wallet address to query
 * @param provider - The ethers.js provider instance
 * @param limit - Maximum number of transactions to return (default: 10)
 * @returns Promise resolving to an array of transaction hashes
 *
 * @throws {Error} If the provider is not connected or address is invalid
 *
 * @example
 * ```typescript
 * const transactions = await getTransactionHistory(
 *   '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
 *   provider,
 *   20
 * );
 * ```
 */
export async function getTransactionHistory(
  address: string,
  provider: JsonRpcProvider,
  limit: number = 10
): Promise<string[]> {
  // Note: This is a simplified implementation
  // For production, you'd want to use a block explorer API or indexing service
  // like The Graph, Alchemy, or Etherscan API

  // Get current block number
  const currentBlock = await provider.getBlockNumber();

  // Search recent blocks (last 100 blocks as a simple approach)
  const searchBlocks = Math.min(100, currentBlock);
  const startBlock = Math.max(0, currentBlock - searchBlocks);

  const transactions: string[] = [];

  // Iterate through blocks (this is simplified - in production use an indexer)
  for (
    let blockNumber = currentBlock;
    blockNumber >= startBlock && transactions.length < limit;
    blockNumber--
  ) {
    try {
      const block = await provider.getBlock(blockNumber, true);

      if (block && block.transactions) {
        for (const tx of block.transactions) {
          // Check if transaction is a TransactionResponse (object with from/to)
          if (
            typeof tx === "object" &&
            tx !== null &&
            "from" in tx &&
            "to" in tx
          ) {
            const transaction = tx as {
              from: string;
              to: string | null;
              hash?: string;
            };
            // Check if transaction is from or to our address
            if (transaction.from === address || transaction.to === address) {
              if (transaction.hash) {
                transactions.push(transaction.hash);
                if (transactions.length >= limit) {
                  break;
                }
              }
            }
          }
        }
      }
    } catch {
      // Skip blocks that fail to fetch
      continue;
    }
  }

  return transactions;
}
