/**
 * Transaction Sending Handler
 *
 * This file contains the complex business logic for sending blockchain transactions.
 * Uses ethers.js to construct, sign, and broadcast transactions.
 *
 * Handles:
 * - Transaction construction (nonce, gas, value)
 * - Transaction signing
 * - Transaction broadcasting
 * - Error handling and retry logic
 *
 * All transaction sending logic is isolated here.
 *
 * Note: These handlers delegate to wallet handlers for actual sending,
 * but provide transaction-specific logic and formatting.
 */

import type { JsonRpcProvider } from "ethers";
import type { Wallet as SDKWallet } from "@/resources/blockchain/wallets/wallets.types";
import type { Transaction } from "@/resources/blockchain/transactions/transactions.types";
import {
  sendNativeToken as walletSendNativeToken,
  sendToken as walletSendToken,
} from "@/resources/blockchain/wallets/handlers/send.handler";

/**
 * Sends a native token transaction (ETH, MATIC, etc.)
 *
 * This is a convenience wrapper around the wallet's `sendNativeToken` function.
 * It handles the entire flow of creating, signing, and broadcasting a transaction
 * to transfer native currency from the provided wallet to a recipient.
 *
 * **Process:**
 * 1. Validates addresses and balance
 * 2. Estimates gas limit and price
 * 3. Constructs transaction object
 * 4. Signs with wallet's private key
 * 5. Broadcasts to the network
 *
 * @param {SDKWallet} wallet - The sender's wallet object
 *   Must contain the private key for signing
 *
 * @param {string} to - The recipient's wallet address
 *   Must be a valid Ethereum-style address
 *
 * @param {string} amount - The amount to send in human-readable format
 *   Example: "1.5" (for 1.5 ETH)
 *   The function handles conversion to wei (10^18)
 *
 * @param {JsonRpcProvider} provider - Connected ethers.js JSON-RPC provider
 *   Must be connected to the network
 *
 * @returns {Promise<Transaction>} A promise that resolves to the submitted transaction object
 *   Contains hash, from, to, value, nonce, etc.
 *
 * @throws {Error} If:
 *   - Insufficient funds (amount + gas)
 *   - Invalid addresses
 *   - Network error
 *   - Transaction execution reverted
 *
 * @example
 * Sending 0.1 ETH
 * ```typescript
 * const tx = await sendNativeToken(
 *   myWallet,
 *   "0xRecipientAddress...",
 *   "0.1",
 *   provider
 * );
 * 
 * console.log(`Transaction sent! Hash: ${tx.hash}`);
 * ```
 *
 * @see {@link walletSendNativeToken} The underlying implementation in wallet handlers
 */
export async function sendNativeToken(
  wallet: SDKWallet,
  to: string,
  amount: string,
  provider: JsonRpcProvider
): Promise<Transaction> {
  // Delegate to wallet send handler
  return walletSendNativeToken(wallet, to, amount, provider);
}

/**
 * Sends an ERC-20 token transaction (USDC, USDT, etc.)
 *
 * This is a convenience wrapper around the wallet's `sendToken` function.
 * It handles the complexities of interacting with ERC-20 smart contracts
 * to transfer tokens.
 *
 * **Process:**
 * 1. Validates addresses and token contract
 * 2. Checks token balance
 * 3. Estimates gas for contract execution
 * 4. Encodes function call data (transfer method)
 * 5. Signs and broadcasts transaction
 *
 * @param {SDKWallet} wallet - The sender's wallet object
 *   Must contain the private key for signing
 *
 * @param {string} tokenAddress - The ERC-20 token contract address
 *   Example: "0x2791..." (USDC on Polygon)
 *
 * @param {string} to - The recipient's wallet address
 *
 * @param {string} amount - The amount to send in human-readable format
 *   Example: "100.50" (for 100.50 USDC)
 *   The function handles conversion based on token decimals
 *
 * @param {JsonRpcProvider} provider - Connected ethers.js JSON-RPC provider
 *
 * @returns {Promise<Transaction>} A promise that resolves to the submitted transaction object
 *
 * @throws {Error} If:
 *   - Insufficient token balance
 *   - Insufficient native token for gas
 *   - Invalid token contract
 *   - Network error
 *
 * @example
 * Sending 50 USDC
 * ```typescript
 * const usdcAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
 * 
 * const tx = await sendToken(
 *   myWallet,
 *   usdcAddress,
 *   "0xRecipientAddress...",
 *   "50.0",
 *   provider
 * );
 * 
 * console.log(`Transfer successful! Hash: ${tx.hash}`);
 * ```
 *
 * @see {@link walletSendToken} The underlying implementation in wallet handlers
 */
export async function sendToken(
  wallet: SDKWallet,
  tokenAddress: string,
  to: string,
  amount: string,
  provider: JsonRpcProvider
): Promise<Transaction> {
  // Delegate to wallet send handler
  return walletSendToken(wallet, tokenAddress, to, amount, provider);
}
