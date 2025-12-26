/**
 * Wallet Transaction Sending Handler
 *
 * This file contains the complex business logic for sending transactions from wallets.
 * Uses ethers.js to sign and broadcast transactions to the blockchain.
 *
 * Handles:
 * - Native token transfers (ETH, POL, etc.)
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
import type {
  Wallet as SDKWallet,
  Network,
  Token,
} from "@/resources/blockchain/wallets/wallets.types";
import type { Transaction } from "@/resources/blockchain/transactions/transactions.types";

/**
 * Sends native cryptocurrency (ETH, POL, etc.) from a wallet to a recipient
 *
 * Creates, signs, and broadcasts a transaction to transfer native tokens on the blockchain.
 * This function handles the complete transaction lifecycle including:
 * - Creating the transaction with proper gas estimation
 * - Signing with the wallet's private key
 * - Broadcasting to the network via RPC provider
 * - Waiting for confirmation (1 block)
 *
 * The transaction is automatically confirmed after being mined in one block.
 *
 * **Important Notes:**
 * - The wallet must have enough balance to cover BOTH the amount AND gas fees
 * - Gas fees are paid in the native token (same as what you're sending)
 * - Transaction will fail if insufficient funds
 *
 * @param {SDKWallet} wallet - The sender's wallet object containing:
 *   - `address`: The wallet address
 *   - `privateKey`: The private key used to sign the transaction
 *
 * @param {string} to - The recipient's wallet address
 *   Must be a valid Ethereum-style address (0x...)
 *
 * @param {string} amount - Amount to send in human-readable format
 *   Example: "1.5" for 1.5 POL or "0.01" for 0.01 ETH
 *   Will be converted to wei (smallest unit) internally
 *
 * @param {JsonRpcProvider} provider - Connected ethers.js JSON-RPC provider
 *   Must be connected to the correct network (Polygon, Ethereum, etc.)
 *
 * @returns {Promise<Transaction>} A promise that resolves to a transaction object containing:
 *   - `hash` (string): Transaction hash for tracking
 *   - `from` (string): Sender address
 *   - `to` (string): Recipient address
 *   - `value` (string): Amount sent in wei
 *   - `status` ("confirmed" | "failed" | "pending"): Transaction status
 *   - `gasLimit`, `gasPrice`, `nonce`: Gas and nonce details
 *   - `blockNumber`, `blockHash`: Block information
 *   - `confirmations` (number): Number of confirmations
 *
 * @throws {Error} If:
 *   - Wallet private key is invalid
 *   - Provider is not connected to the network
 *   - Insufficient funds (balance < amount + gas fees)
 *   - Recipient address is invalid
 *   - Network error or RPC failure
 *
 * @example
 * Sending POL on Polygon
 * ```typescript
 * const wallet = await createWallet();
 * const provider = new JsonRpcProvider("https://polygon-rpc.com");
 *
 * const tx = await sendNativeToken(
 *   wallet,
 *   "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
 *   "1.5", // Send 1.5 POL
 *   provider
 * );
 *
 * console.log("Transaction hash:", tx.hash);
 * console.log("Status:", tx.status); // "confirmed"
 * console.log("Block number:", tx.blockNumber);
 * ```
 *
 * @example
 * Sending with balance check
 * ```typescript
 * async function sendWithCheck(wallet: SDKWallet, to: string, amount: string) {
 *   // Check balance first
 *   const balance = await getBalance(wallet.address, provider);
 *
 *   if (parseFloat(balance) < parseFloat(amount)) {
 *     throw new Error("Insufficient balance");
 *   }
 *
 *   // Send transaction
 *   const tx = await sendNativeToken(wallet, to, amount, provider);
 *
 *   return {
 *     success: true,
 *     txHash: tx.hash,
 *     blockNumber: tx.blockNumber,
 *   };
 * }
 * ```
 *
 * @example
 * Handling transaction errors
 * ```typescript
 * try {
 *   const tx = await sendNativeToken(wallet, recipientAddress, "10.0", provider);
 *   console.log("Success! Hash:", tx.hash);
 * } catch (error) {
 *   if (error.message.includes("insufficient funds")) {
 *     console.error("Not enough balance to cover amount + gas fees");
 *   } else if (error.message.includes("invalid address")) {
 *     console.error("Recipient address is invalid");
 *   } else {
 *     console.error("Transaction failed:", error.message);
 *   }
 * }
 * ```
 *
 * @see {@link sendToken} To send ERC-20 tokens instead of native tokens
 * @see {@link getBalance} To check wallet balance before sending
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
 * Sends ERC-20 tokens (USDC, USDT, DAI, etc.) from a wallet to a recipient
 *
 * Creates, signs, and broadcasts a transaction to transfer ERC-20 tokens by interacting with
 * the token's smart contract. This function:
 * - Reads the token's decimal places from the contract
 * - Calls the contract's `transfer` function
 * - Signs the transaction with the wallet's private key
 * - Broadcasts to the network and waits for confirmation
 *
 * **Important Notes:**
 * - Gas fees are paid in NATIVE tokens (ETH, POL, etc.), NOT the token being sent
 * - The wallet must have enough native tokens for gas fees
 * - The wallet must have enough of the ERC-20 token to send
 * - Each network has different contract addresses for the same token (USDC on Polygon ≠ USDC on Ethereum)
 *
 * @param {SDKWallet} wallet - The sender's wallet object containing:
 *   - `address`: The wallet address
 *   - `privateKey`: The private key used to sign the transaction
 *
 * @param {string} tokenAddress - The ERC-20 token contract address
 *   Example: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" (USDC on Polygon)
 *   Must be a valid contract address on the connected network
 *
 * @param {string} to - The recipient's wallet address
 *   Must be a valid Ethereum-style address
 *
 * @param {string} amount - Amount to send in human-readable format
 *   Example: "100.0" for 100 USDC or "0.5" for 0.5 USDT
 *   Will be converted to the token's smallest unit based on its decimals
 *
 * @param {JsonRpcProvider} provider - Connected ethers.js JSON-RPC provider
 *   Must be connected to the network where the token contract exists
 *
 * @returns {Promise<Transaction>} A promise that resolves to a transaction object containing:
 *   - `hash` (string): Transaction hash
 *   - `from` (string): Sender address
 *   - `to` (string): Token contract address (not recipient!)
 *   - `value` (string): Always "0" for token transfers (value is in the contract call)
 *   - `status` ("confirmed" | "failed" | "pending"): Transaction status
 *   - `gasLimit`, `gasPrice`: Gas details
 *   - `blockNumber`, `blockHash`: Block information
 *
 * @throws {Error} If:
 *   - Wallet private key is invalid
 *   - Provider is not connected
 *   - Token contract address is invalid or not an ERC-20 token
 *   - Insufficient token balance
 *   - Insufficient native token balance for gas fees
 *   - Recipient address is invalid
 *   - Token contract doesn't implement required functions (decimals, transfer)
 *
 * @example
 * Sending USDC on Polygon
 * ```typescript
 * const wallet = await createWallet();
 * const provider = new JsonRpcProvider("https://polygon-rpc.com");
 *
 * const tx = await sendToken(
 *   wallet,
 *   "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC contract on Polygon
 *   "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", // Recipient
 *   "100.0", // Send 100 USDC
 *   provider
 * );
 *
 * console.log("Token transfer hash:", tx.hash);
 * console.log("Status:", tx.status);
 * ```
 *
 * @example
 * Sending with balance validation
 * ```typescript
 * async function sendTokenSafely(
 *   wallet: SDKWallet,
 *   tokenAddress: string,
 *   to: string,
 *   amount: string,
 *   provider: JsonRpcProvider
 * ) {
 *   // Check token balance
 *   const tokenBalance = await getTokenBalance(
 *     wallet.address,
 *     tokenAddress,
 *     provider
 *   );
 *
 *   if (parseFloat(tokenBalance) < parseFloat(amount)) {
 *     throw new Error(`Insufficient token balance. Have: ${tokenBalance}, Need: ${amount}`);
 *   }
 *
 *   // Check native token balance for gas
 *   const nativeBalance = await getBalance(wallet.address, provider);
 *   if (parseFloat(nativeBalance) < 0.01) {
 *     throw new Error("Insufficient balance for gas fees");
 *   }
 *
 *   // Send token
 *   return await sendToken(wallet, tokenAddress, to, amount, provider);
 * }
 * ```
 *
 * @example
 * Sending different tokens
 * ```typescript
 * // USDC on Polygon (6 decimals)
 * await sendToken(
 *   wallet,
 *   "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
 *   recipient,
 *   "50.0",
 *   polygonProvider
 * );
 *
 * // USDT on Ethereum (6 decimals)
 * await sendToken(
 *   wallet,
 *   "0xdAC17F958D2ee523a2206206994597C13D831ec7",
 *   recipient,
 *   "50.0",
 *   ethereumProvider
 * );
 *
 * // DAI on Ethereum (18 decimals)
 * await sendToken(
 *   wallet,
 *   "0x6B175474E89094C44Da98b954EedeAC495271d0F",
 *   recipient,
 *   "50.0",
 *   ethereumProvider
 * );
 * ```
 *
 * @see {@link sendNativeToken} To send native tokens (ETH, POL) instead
 * @see {@link getTokenBalance} To check token balance before sending
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
