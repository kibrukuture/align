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
 * Estimates the gas limit required for a transaction
 *
 * Simulates the transaction execution on the blockchain node to determine how much gas
 * will be consumed. This is crucial for ensuring transactions don't fail out of gas.
 *
 * **How it works:**
 * The node runs the transaction in a virtual environment without broadcasting it.
 * It returns the exact amount of gas used.
 *
 * **Important Notes:**
 * - The actual gas used may vary slightly from the estimate
 * - It's common practice to add a buffer (e.g., +10-20%) to this estimate
 * - If the transaction would fail (e.g., insufficient funds), this function will throw
 *
 * @param {string} from - The sender's wallet address
 *   Must be a valid Ethereum-style address
 *
 * @param {string} to - The recipient's wallet address
 *   Must be a valid Ethereum-style address
 *
 * @param {string} value - The amount of native token to send in wei
 *   Example: "1000000000000000000" (1 ETH)
 *   Use "0" for contract calls that don't send value
 *
 * @param {string | undefined} data - Optional hex data for contract interactions
 *   Example: "0xa9059cbb..." (ERC-20 transfer data)
 *   Use undefined or "0x" for simple transfers
 *
 * @param {JsonRpcProvider} provider - Connected ethers.js JSON-RPC provider
 *   Must be connected to the network
 *
 * @returns {Promise<string>} A promise that resolves to the estimated gas limit
 *   Example: "21000" (standard transfer) or "65000" (token transfer)
 *
 * @throws {Error} If:
 *   - Transaction would fail (revert)
 *   - Provider is not connected
 *   - Addresses are invalid
 *   - Network RPC error
 *
 * @example
 * Estimating a simple transfer
 * ```typescript
 * const gasLimit = await estimateGas(
 *   "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", // From
 *   "0x1234567890abcdef1234567890abcdef12345678", // To
 *   "1000000000000000000", // 1 ETH in wei
 *   undefined, // No data
 *   provider
 * );
 * console.log(`Gas limit: ${gasLimit}`); // "21000"
 * ```
 *
 * @example
 * Estimating with a buffer
 * ```typescript
 * const estimated = await estimateGas(from, to, value, data, provider);
 * 
 * // Add 20% buffer for safety
 * const safeGasLimit = (BigInt(estimated) * 120n / 100n).toString();
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
 * Retrieves the current gas price from the network
 *
 * Queries the blockchain node for the current fee data. This supports both:
 * - Legacy gas price (pre-EIP-1559)
 * - EIP-1559 maxFeePerGas (modern standard)
 *
 * The returned price represents the cost per unit of gas in wei.
 * Total transaction cost = gasLimit * gasPrice.
 *
 * **Network Variations:**
 * - Polygon: Often has higher gas prices during congestion
 * - Arbitrum/Optimism: L2s usually have much lower gas prices
 * - Ethereum: Gas prices fluctuate significantly
 *
 * @param {JsonRpcProvider} provider - Connected ethers.js JSON-RPC provider
 *   Must be connected to the network
 *
 * @returns {Promise<string>} A promise that resolves to the gas price in wei
 *   Example: "30000000000" (30 gwei)
 *
 * @throws {Error} If:
 *   - Provider is not connected
 *   - Network fails to return fee data
 *
 * @example
 * Getting current gas price
 * ```typescript
 * const gasPrice = await getGasPrice(provider);
 * console.log(`Gas Price: ${gasPrice} wei`);
 * ```
 *
 * @example
 * Displaying in Gwei (human readable)
 * ```typescript
 * import { formatUnits } from "ethers";
 * 
 * const gasPriceWei = await getGasPrice(provider);
 * const gasPriceGwei = formatUnits(gasPriceWei, 9);
 * 
 * console.log(`Current Gas: ${gasPriceGwei} Gwei`);
 * // Output: Current Gas: 30.5 Gwei
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
 * Estimates the gas limit for an ERC-20 token transfer
 *
 * Specifically estimates gas for calling the `transfer` function on an ERC-20 token contract.
 * This is more complex than a native transfer because it involves executing smart contract code.
 *
 * **Factors affecting token transfer gas:**
 * - Token contract implementation complexity
 * - Storage updates (changing balances)
 * - Network congestion
 *
 * Typical cost is ~65,000 gas, but can vary.
 *
 * @param {string} from - The sender's wallet address
 *   Must have enough tokens to transfer
 *
 * @param {string} tokenAddress - The ERC-20 token contract address
 *   Must be a valid contract
 *
 * @param {string} to - The recipient's wallet address
 *
 * @param {string} amount - The amount to transfer in token's smallest unit
 *   Example: "1000000" (1 USDC)
 *
 * @param {JsonRpcProvider} provider - Connected ethers.js JSON-RPC provider
 *
 * @returns {Promise<string>} A promise that resolves to the estimated gas limit
 *   Example: "65000"
 *
 * @throws {Error} If:
 *   - Token contract is invalid
 *   - Sender has insufficient tokens (some contracts check this)
 *   - Transaction would revert
 *
 * @example
 * Estimating USDC transfer
 * ```typescript
 * const gasLimit = await estimateTokenTransferGas(
 *   "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", // From
 *   "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC Contract
 *   "0x1234567890abcdef1234567890abcdef12345678", // To
 *   "1000000", // 1 USDC
 *   provider
 * );
 * console.log(`Estimated gas: ${gasLimit}`);
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
 * Calculates the total estimated cost of a transaction
 *
 * Combines gas limit and gas price to determine the total network fee in native tokens.
 * This is useful for showing users "Max Network Fee" before they confirm a transaction.
 *
 * **Formula:**
 * Total Cost (wei) = Gas Limit * Gas Price (wei)
 *
 * @param {string} gasLimit - The estimated gas limit
 *   Example: "21000"
 *
 * @param {string} gasPrice - The current gas price in wei
 *   Example: "30000000000" (30 gwei)
 *
 * @returns {Promise<GasEstimate>} A promise that resolves to the cost estimate object:
 *   - `gasLimit`: The input gas limit
 *   - `gasPrice`: The input gas price
 *   - `totalCost`: Total cost in wei (string)
 *   - `totalCostFormatted`: Total cost in native token (e.g., "0.00063")
 *
 * @example
 * Calculating cost for UI
 * ```typescript
 * const gasLimit = "21000";
 * const gasPrice = "30000000000"; // 30 gwei
 * 
 * const estimate = await calculateTransactionCost(gasLimit, gasPrice);
 * 
 * console.log(`Max Fee: ${estimate.totalCostFormatted} ETH`);
 * // Output: Max Fee: 0.00063 ETH
 * ```
 *
 * @example
 * Full estimation flow
 * ```typescript
 * // 1. Get gas price
 * const gasPrice = await getGasPrice(provider);
 * 
 * // 2. Estimate limit
 * const gasLimit = await estimateGas(from, to, value, undefined, provider);
 * 
 * // 3. Calculate total
 * const cost = await calculateTransactionCost(gasLimit, gasPrice);
 * 
 * console.log(`Estimated fee: ${cost.totalCostFormatted}`);
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
