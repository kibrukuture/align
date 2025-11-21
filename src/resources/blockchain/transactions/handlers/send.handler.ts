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
import type { Wallet as SDKWallet } from "../../wallets/wallets.types";
import type { Transaction } from "../transactions.types";
import {
  sendNativeTokenHandler as walletSendNativeToken,
  sendTokenHandler as walletSendToken,
} from "../../wallets/handlers/send.handler";

/**
 * Send native token transaction
 *
 * Delegates to wallet send handler but provides transaction-specific interface.
 *
 * @param wallet - The wallet object containing address and private key
 * @param to - The recipient address
 * @param amount - The amount to send (as string, e.g., "1.5")
 * @param provider - The ethers.js provider instance
 * @returns Promise resolving to the transaction object
 *
 * @throws {Error} If the wallet is invalid, provider is not connected, or transaction fails
 *
 * @example
 * ```typescript
 * const tx = await sendNativeTokenHandler(wallet, '0x742d35...', '1.5', provider);
 * ```
 */
export async function sendNativeTokenHandler(
  wallet: SDKWallet,
  to: string,
  amount: string,
  provider: JsonRpcProvider
): Promise<Transaction> {
  // Delegate to wallet send handler
  return walletSendNativeToken(wallet, to, amount, provider);
}

/**
 * Send ERC-20 token transaction
 *
 * Delegates to wallet send handler but provides transaction-specific interface.
 *
 * @param wallet - The wallet object containing address and private key
 * @param tokenAddress - The ERC-20 token contract address
 * @param to - The recipient address
 * @param amount - The amount to send (as string, e.g., "100.0")
 * @param provider - The ethers.js provider instance
 * @returns Promise resolving to the transaction object
 *
 * @throws {Error} If the wallet is invalid, provider is not connected, token contract is invalid, or transaction fails
 *
 * @example
 * ```typescript
 * const tx = await sendTokenHandler(wallet, tokenAddress, '0x742d35...', '100.0', provider);
 * ```
 */
export async function sendTokenHandler(
  wallet: SDKWallet,
  tokenAddress: string,
  to: string,
  amount: string,
  provider: JsonRpcProvider
): Promise<Transaction> {
  // Delegate to wallet send handler
  return walletSendToken(wallet, tokenAddress, to, amount, provider);
}
