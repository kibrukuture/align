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
 * Extracts the wallet address from a wallet object
 *
 * Simple utility function that returns the public address from a wallet object.
 * The address is safe to share publicly and is used to receive funds.
 *
 * @param {SDKWallet} wallet - The wallet object containing address and private key
 *
 * @returns {string} The wallet's public address
 *   Example: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
 *
 * @example
 * Basic usage
 * ```typescript
 * const wallet = await createWallet();
 * const address = getAddressFromWallet(wallet);
 * console.log("Wallet address:", address);
 * // Output: Wallet address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
 * ```
 *
 * @example
 * Displaying to user
 * ```typescript
 * const wallet = await createFromEncrypted(encrypted, password);
 * const address = getAddressFromWallet(wallet);
 *
 * return {
 *   message: "Wallet unlocked successfully",
 *   address,
 * };
 * ```
 */
export function getAddressFromWallet(wallet: SDKWallet): string {
  return wallet.address;
}

/**
 * Retrieves the native token balance for a wallet address
 *
 * Queries the blockchain via RPC provider to get the native cryptocurrency balance
 * (ETH on Ethereum, POL on Polygon, etc.) for a given address.
 *
 * The balance is returned in human-readable format (e.g., "1.5" POL) rather than
 * the smallest unit (wei). This makes it easy to display to users.
 *
 * **Important Notes:**
 * - This only returns NATIVE token balance, not ERC-20 tokens
 * - For ERC-20 tokens (USDC, USDT, etc.), use getTokenBalance instead
 * - The provider must be connected to the correct network
 *
 * @param {string} address - The wallet address to query
 *   Must be a valid Ethereum-style address (0x...)
 *
 * @param {JsonRpcProvider} provider - Connected ethers.js JSON-RPC provider
 *   Must be connected to the blockchain network you want to query
 *
 * @returns {Promise<string>} A promise that resolves to the balance as a string
 *   Formatted with 18 decimals (standard for native tokens)
 *   Example: "1.5" for 1.5 POL or "0.025" for 0.025 ETH
 *
 * @throws {Error} If:
 *   - Provider is not connected to the network
 *   - Address is invalid or malformed
 *   - Network RPC error
 *
 * @example
 * Checking wallet balance on Polygon
 * ```typescript
 * const provider = new JsonRpcProvider("https://polygon-rpc.com");
 * const balance = await getBalance(
 *   "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
 *   provider
 * );
 *
 * console.log(`Balance: ${balance} POL`);
 * // Output: Balance: 1.5 POL
 * ```
 *
 * @example
 * Checking before sending transaction
 * ```typescript
 * async function canSend(wallet: SDKWallet, amount: string, provider: JsonRpcProvider) {
 *   const balance = await getBalance(wallet.address, provider);
 *
 *   if (parseFloat(balance) < parseFloat(amount)) {
 *     return {
 *       canSend: false,
 *       message: `Insufficient balance. Have: ${balance}, Need: ${amount}`,
 *     };
 *   }
 *
 *   return { canSend: true };
 * }
 * ```
 *
 * @example
 * Displaying balance to user
 * ```typescript
 * const balance = await getBalance(userAddress, provider);
 * const formattedBalance = parseFloat(balance).toFixed(4);
 *
 * console.log(`Your balance: ${formattedBalance} POL`);
 * // Output: Your balance: 1.5000 POL
 * ```
 *
 * @see {@link getTokenBalance} To get ERC-20 token balance instead
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
 * Retrieves the ERC-20 token balance for a wallet address
 *
 * Queries an ERC-20 token smart contract to get the token balance for a given address.
 * This works for any standard ERC-20 token (USDC, USDT, DAI, etc.).
 *
 * The function automatically reads the token's decimal places from the contract and
 * formats the balance in human-readable format.
 *
 * **Important Notes:**
 * - This is for ERC-20 TOKENS only, not native tokens (ETH, POL)
 * - For native tokens, use getBalance instead
 * - Token contract addresses differ across networks (USDC on Polygon ≠ USDC on Ethereum)
 * - The provider must be connected to the network where the token contract exists
 *
 * @param {string} address - The wallet address to query
 *   Must be a valid Ethereum-style address
 *
 * @param {string} tokenAddress - The ERC-20 token contract address
 *   Example: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" (USDC on Polygon)
 *   Must be a valid contract address on the connected network
 *
 * @param {JsonRpcProvider} provider - Connected ethers.js JSON-RPC provider
 *   Must be connected to the network where the token exists
 *
 * @returns {Promise<string>} A promise that resolves to the token balance as a string
 *   Formatted with the token's decimal places (varies by token)
 *   Example: "100.0" for 100 USDC or "0.5" for 0.5 USDT
 *
 * @throws {Error} If:
 *   - Provider is not connected
 *   - Address is invalid
 *   - Token contract address is invalid or not an ERC-20 token
 *   - Token contract doesn't implement required functions (balanceOf, decimals)
 *   - Network RPC error
 *
 * @example
 * Checking USDC balance on Polygon
 * ```typescript
 * const provider = new JsonRpcProvider("https://polygon-rpc.com");
 * const usdcAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
 *
 * const balance = await getTokenBalance(
 *   "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
 *   usdcAddress,
 *   provider
 * );
 *
 * console.log(`USDC Balance: ${balance}`);
 * // Output: USDC Balance: 100.0
 * ```
 *
 * @example
 * Checking multiple token balances
 * ```typescript
 * async function getAllTokenBalances(address: string, provider: JsonRpcProvider) {
 *   const tokens = {
 *     USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
 *     USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
 *     DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
 *   };
 *
 *   const balances = await Promise.all(
 *     Object.entries(tokens).map(async ([symbol, tokenAddress]) => {
 *       const balance = await getTokenBalance(address, tokenAddress, provider);
 *       return { symbol, balance };
 *     })
 *   );
 *
 *   return balances;
 *   // Output: [{symbol: "USDC", balance: "100.0"}, ...]
 * }
 * ```
 *
 * @example
 * Validating sufficient token balance
 * ```typescript
 * async function hasEnoughTokens(
 *   wallet: SDKWallet,
 *   tokenAddress: string,
 *   requiredAmount: string,
 *   provider: JsonRpcProvider
 * ) {
 *   const balance = await getTokenBalance(
 *     wallet.address,
 *     tokenAddress,
 *     provider
 *   );
 *
 *   return parseFloat(balance) >= parseFloat(requiredAmount);
 * }
 * ```
 *
 * @see {@link getBalance} To get native token balance instead
 * @see {@link sendToken} To send ERC-20 tokens
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
 * Retrieves recent transaction history for a wallet address
 *
 * Searches recent blocks to find transactions sent from or received by the given address.
 * Returns an array of transaction hashes that can be used to fetch full transaction details.
 *
 * **Important Notes:**
 * - This is a SIMPLIFIED implementation that searches only the last 100 blocks
 * - For production apps, use a block explorer API (Etherscan, Polygonscan) or indexing service
 *   (The Graph, Alchemy, Moralis) for better performance and complete history
 * - This function can be slow on networks with high transaction volume
 * - Limited to recent transactions only (not full history)
 *
 * **Why use an indexer in production:**
 * - Much faster (indexed data vs. scanning blocks)
 * - Complete transaction history (not just last 100 blocks)
 * - Additional metadata (token transfers, internal transactions, etc.)
 * - Lower RPC usage and costs
 *
 * @param {string} address - The wallet address to query
 *   Must be a valid Ethereum-style address
 *
 * @param {JsonRpcProvider} provider - Connected ethers.js JSON-RPC provider
 *   Must be connected to the blockchain network
 *
 * @param {number} [limit=10] - Maximum number of transactions to return
 *   Default: 10. Will return fewer if not enough transactions found in recent blocks
 *
 * @returns {Promise<string[]>} A promise that resolves to an array of transaction hashes
 *   Example: ["0x1234...", "0x5678...", "0x9abc..."]
 *   Empty array if no transactions found
 *
 * @throws {Error} If:
 *   - Provider is not connected
 *   - Address is invalid
 *   - Network RPC error
 *
 * @example
 * Getting recent transactions
 * ```typescript
 * const provider = new JsonRpcProvider("https://polygon-rpc.com");
 * const txHashes = await getTransactionHistory(
 *   "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
 *   provider,
 *   20 // Get last 20 transactions
 * );
 *
 * console.log(`Found ${txHashes.length} recent transactions`);
 * txHashes.forEach(hash => console.log(hash));
 * ```
 *
 * @example
 * Fetching full transaction details
 * ```typescript
 * const txHashes = await getTransactionHistory(address, provider, 10);
 *
 * // Fetch full details for each transaction
 * const transactions = await Promise.all(
 *   txHashes.map(hash => provider.getTransaction(hash))
 * );
 *
 * transactions.forEach(tx => {
 *   console.log(`From: ${tx.from}, To: ${tx.to}, Value: ${tx.value}`);
 * });
 * ```
 *
 * @example
 * Production-ready approach with block explorer API
 * ```typescript
 * // Instead of this function, use a block explorer API:
 * async function getTransactionHistoryProduction(address: string) {
 *   const apiKey = "YOUR_POLYGONSCAN_API_KEY";
 *   const url = `https://api.polygonscan.com/api?module=account&action=txlist&address=${address}&apikey=${apiKey}`;
 *
 *   const response = await fetch(url);
 *   const data = await response.json();
 *
 *   return data.result; // Full transaction history with metadata
 * }
 * ```
 *
 * @see {@link getBalance} To get current balance
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
