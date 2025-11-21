/**
 * Gas Estimation Handler
 *
 * This file contains the complex business logic for estimating transaction gas costs.
 * Uses ethers.js to estimate gas limits and fetch current gas prices.
 *
 * Handles:
 * - Gas limit estimation
 * - Gas price retrieval (current network fees)
 * - Total transaction cost calculation
 * - Token transfer gas estimation
 * - Contract interaction gas estimation
 *
 * All gas estimation logic is isolated here.
 */

import { parseUnits, formatUnits } from "ethers";
import type { JsonRpcProvider } from "ethers";
import type { GasEstimate } from "@/resources/blockchain/transactions/transactions.types";

/**
 * Estimate gas limit for a transaction
 *
 * Estimates the gas limit needed for a transaction without actually sending it.
 *
 * @param from - The sender address
 * @param to - The recipient address
 * @param value - The transaction value in wei (as string)
 * @param data - Optional transaction data (for contract calls)
 * @param provider - The ethers.js provider instance
 * @returns Promise resolving to the estimated gas limit as a string
 *
 * @throws {Error} If the provider is not connected or estimation fails
 *
 * @example
 * ```typescript
 * const gasLimit = await estimateGas(
 *   '0x742d35...',
 *   '0x1234...abcd',
 *   '1000000000000000000',
 *   undefined,
 *   provider
 * );
 * console.log(gasLimit); // "21000"
 * ```
 */
export async function estimateGas(
  from: string,
  to: string,
  value: string,
  data: string | undefined,
  provider: JsonRpcProvider
): Promise<string> {
  // Estimate gas for the transaction
  const gasEstimate = await provider.estimateGas({
    from,
    to,
    value: parseUnits(value, 0), // value is already in wei
    data: data || "0x",
  });

  return gasEstimate.toString();
}

/**
 * Get current gas price
 *
 * Retrieves the current gas price from the network.
 *
 * @param provider - The ethers.js provider instance
 * @returns Promise resolving to the gas price in wei as a string
 *
 * @throws {Error} If the provider is not connected
 *
 * @example
 * ```typescript
 * const gasPrice = await getGasPrice(provider);
 * console.log(gasPrice); // "20000000000" (20 gwei)
 * ```
 */
export async function getGasPrice(
  provider: JsonRpcProvider
): Promise<string> {
  // Get fee data from provider
  const feeData = await provider.getFeeData();

  // Use gasPrice (legacy) or maxFeePerGas (EIP-1559)
  const gasPrice = feeData.gasPrice || feeData.maxFeePerGas;

  if (!gasPrice) {
    throw new Error("Unable to retrieve gas price from network");
  }

  return gasPrice.toString();
}

/**
 * Estimate gas for ERC-20 token transfer
 *
 * Estimates the gas limit needed for an ERC-20 token transfer.
 *
 * @param from - The sender address
 * @param tokenAddress - The ERC-20 token contract address
 * @param to - The recipient address
 * @param amount - The amount to transfer in wei (as string)
 * @param provider - The ethers.js provider instance
 * @returns Promise resolving to the estimated gas limit as a string
 *
 * @throws {Error} If the provider is not connected, token contract is invalid, or estimation fails
 *
 * @example
 * ```typescript
 * const gasLimit = await estimateTokenTransferGas(
 *   '0x742d35...',
 *   '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC
 *   '0x1234...abcd',
 *   '100000000', // 100 USDC (6 decimals)
 *   provider
 * );
 * ```
 */
export async function estimateTokenTransferGas(
  from: string,
  tokenAddress: string,
  to: string,
  amount: string,
  provider: JsonRpcProvider
): Promise<string> {
  // ERC-20 transfer function ABI
  const transferAbi = [
    "function transfer(address to, uint256 amount) returns (bool)",
  ];

  // Create contract instance (read-only)
  const { Contract } = await import("ethers");
  const tokenContract = new Contract(tokenAddress, transferAbi, provider);

  // Get transfer function
  const transferFunction = tokenContract.getFunction("transfer");
  if (!transferFunction) {
    throw new Error("Token contract does not implement transfer() function");
  }

  // Estimate gas for transfer
  const gasEstimate = await transferFunction.estimateGas(to, amount);

  return gasEstimate.toString();
}

/**
 * Calculate total transaction cost
 *
 * Calculates the total cost of a transaction (gasLimit * gasPrice) in wei
 * and formats it in the native token.
 *
 * @param gasLimit - The gas limit as a string
 * @param gasPrice - The gas price in wei as a string
 * @returns Promise resolving to gas estimate with total cost
 *
 * @example
 * ```typescript
 * const estimate = await calculateTransactionCost('21000', '20000000000');
 * console.log(estimate.totalCost); // "420000000000000" (in wei)
 * console.log(estimate.totalCostFormatted); // "0.00042" (in ETH)
 * ```
 */
export async function calculateTransactionCost(
  gasLimit: string,
  gasPrice: string
): Promise<GasEstimate> {
  // Calculate total cost in wei
  const gasLimitBigInt = BigInt(gasLimit);
  const gasPriceBigInt = BigInt(gasPrice);
  const totalCostWei = gasLimitBigInt * gasPriceBigInt;

  // Format total cost in native token (18 decimals)
  const totalCostFormatted = formatUnits(totalCostWei, 18);

  return {
    gasLimit,
    gasPrice,
    totalCost: totalCostWei.toString(),
    totalCostFormatted,
  };
}
