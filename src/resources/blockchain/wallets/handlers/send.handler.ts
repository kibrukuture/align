/**
 * Wallet Transaction Sending Handler
 *
 * This file contains the complex business logic for sending transactions from wallets.
 * Uses ethers.js to sign and broadcast transactions to the blockchain.
 *
 * Handles:
 * - Native token transfers (ETH, MATIC, etc.)
 * - ERC-20 token transfers (USDC, USDT, etc.)
 * - Transaction signing with private keys
 * - Gas estimation and fee calculation
 * - Transaction broadcasting to RPC providers
 *
 * All transaction sending logic is isolated here.
 */

import { Wallet, Contract, parseUnits, formatUnits } from "ethers";
import type { JsonRpcProvider } from "ethers";
import type { TransactionResponse } from "ethers";
import type { Wallet as SDKWallet, Network, Token } from "@/resources/blockchain/wallets/wallets.types";
import type { Transaction } from "@/resources/blockchain/transactions/transactions.types";

/**
 * Send native token (ETH, MATIC, etc.) from a wallet
 *
 * Creates and broadcasts a transaction to send native tokens to a recipient address.
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
 * const tx = await sendNativeToken(
 *   wallet,
 *   '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
 *   '1.5',
 *   provider
 * );
 * console.log(tx.hash); // Transaction hash
 * ```
 */
export async function sendNativeToken(
  wallet: SDKWallet,
  to: string,
  amount: string,
  provider: JsonRpcProvider
): Promise<Transaction> {
  // Create ethers wallet from private key
  const normalizedKey = wallet.privateKey.startsWith("0x")
    ? wallet.privateKey
    : `0x${wallet.privateKey}`;
  const ethersWallet = new Wallet(normalizedKey);

  // Connect wallet to provider
  const connectedWallet = ethersWallet.connect(provider);

  // Parse amount to wei (18 decimals for native tokens)
  const amountWei = parseUnits(amount, 18);

  // Send transaction
  const txResponse: TransactionResponse = await connectedWallet.sendTransaction(
    {
      to,
      value: amountWei,
    }
  );

  // Wait for transaction to be mined (1 confirmation)
  const receipt = await txResponse.wait(1);

  // Get confirmations (it's a getter that may return a Promise)
  const confirmationsValue = txResponse.confirmations;
  const confirmations =
    typeof confirmationsValue === "number"
      ? confirmationsValue
      : await confirmationsValue();

  // Convert to our SDK transaction format
  return {
    hash: txResponse.hash,
    from: txResponse.from,
    to: txResponse.to,
    value: txResponse.value.toString(),
    status: receipt
      ? receipt.status === 1
        ? "confirmed"
        : "failed"
      : "pending",
    network: "ethereum", // Will be set by the resource based on provider
    gasLimit: txResponse.gasLimit.toString(),
    gasPrice: txResponse.gasPrice?.toString() || "0",
    nonce: txResponse.nonce,
    blockNumber: receipt?.blockNumber || null,
    blockHash: receipt?.blockHash || null,
    confirmations,
    timestamp: Date.now(),
    data: txResponse.data,
    ethersTx: txResponse,
  };
}

/**
 * Send ERC-20 token (USDC, USDT, etc.) from a wallet
 *
 * Creates and broadcasts a transaction to send ERC-20 tokens to a recipient address.
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
 * const tx = await sendToken(
 *   wallet,
 *   '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC on Polygon
 *   '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
 *   '100.0',
 *   provider
 * );
 * console.log(tx.hash); // Transaction hash
 * ```
 */
export async function sendToken(
  wallet: SDKWallet,
  tokenAddress: string,
  to: string,
  amount: string,
  provider: JsonRpcProvider
): Promise<Transaction> {
  // Create ethers wallet from private key
  const normalizedKey = wallet.privateKey.startsWith("0x")
    ? wallet.privateKey
    : `0x${wallet.privateKey}`;
  const ethersWallet = new Wallet(normalizedKey);

  // Connect wallet to provider
  const connectedWallet = ethersWallet.connect(provider);

  // ERC-20 token standard ABI for transfer function
  const erc20Abi = [
    "function transfer(address to, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)",
  ];

  // Create contract instance
  const tokenContract = new Contract(tokenAddress, erc20Abi, connectedWallet);

  // Get decimals function
  const decimalsFunction = tokenContract.getFunction("decimals");
  if (!decimalsFunction) {
    throw new Error("Token contract does not implement decimals() function");
  }

  // Get token decimals
  const decimals = await decimalsFunction();

  // Parse amount with token decimals
  const amountWei = parseUnits(amount, decimals);

  // Get transfer function
  const transferFunction = tokenContract.getFunction("transfer");
  if (!transferFunction) {
    throw new Error("Token contract does not implement transfer() function");
  }

  // Send transfer transaction
  const txResponse: TransactionResponse = await transferFunction(to, amountWei);

  // Wait for transaction to be mined (1 confirmation)
  const receipt = await txResponse.wait(1);

  // Get confirmations (it's a getter that may return a Promise)
  const confirmationsValue = txResponse.confirmations;
  const confirmations =
    typeof confirmationsValue === "number"
      ? confirmationsValue
      : await confirmationsValue();

  // Convert to our SDK transaction format
  return {
    hash: txResponse.hash,
    from: txResponse.from,
    to: txResponse.to,
    value: txResponse.value.toString(),
    status: receipt
      ? receipt.status === 1
        ? "confirmed"
        : "failed"
      : "pending",
    network: "ethereum", // Will be set by the resource based on provider
    gasLimit: txResponse.gasLimit.toString(),
    gasPrice: txResponse.gasPrice?.toString() || "0",
    nonce: txResponse.nonce,
    blockNumber: receipt?.blockNumber || null,
    blockHash: receipt?.blockHash || null,
    confirmations,
    timestamp: Date.now(),
    data: txResponse.data,
    ethersTx: txResponse,
  };
}
