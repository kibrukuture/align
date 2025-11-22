/**
 * Multicall Utilities
 *
 * Provides functionality to batch multiple smart contract calls into a single transaction
 * or read operation using the Multicall3 contract. This significantly reduces network
 * latency and improves performance for bulk data fetching.
 *
 * **Key Features:**
 * - Batch multiple contract calls into one RPC request
 * - Reduce network latency for bulk operations
 * - Support for partial failures (tryAggregate)
 * - Helper functions for encoding/decoding calls
 *
 * **Multicall3 Contract:**
 * The default Multicall3 address (`0xcA11bde05977b3631167028862bE2a173976CA11`) is deployed
 * on most EVM networks at the same address. You can override this if needed.
 *
 * @see https://www.multicall3.com/
 *
 * @example
 * ```typescript
 * import { aggregate, encodeCall } from '@schnl/align';
 *
 * // Encode calls
 * const call1 = encodeCall(erc20Abi, 'balanceOf', [address1]);
 * const call2 = encodeCall(erc20Abi, 'balanceOf', [address2]);
 *
 * // Batch execute
 * const results = await aggregate([
 *   { target: tokenAddress, callData: call1 },
 *   { target: tokenAddress, callData: call2 }
 * ], provider);
 * ```
 */
import { Contract, JsonRpcProvider, Interface } from "ethers";
import type { InterfaceAbi } from "ethers";

/**
 * Default Multicall3 contract address (same on most networks)
 * @constant
 */
export const DEFAULT_MULTICALL3_ADDRESS =
  "0xcA11bde05977b3631167028862bE2a173976CA11";

/**
 * Multicall3 contract ABI
 * @constant
 */
export const MULTICALL3_ABI = [
  "function aggregate(tuple(address target, bytes callData)[] calls) view returns (uint256 blockNumber, bytes[] returnData)",
  "function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) view returns (tuple(bool success, bytes returnData)[])",
] as const;

/**
 * Represents a single contract call in a multicall batch
 */
export interface Call {
  /** The target contract address */
  target: string;
  /** The encoded call data */
  callData: string;
}

/**
 * Represents the result of a single call in a multicall batch
 */
export interface CallResult {
  /** Whether the call succeeded */
  success: boolean;
  /** The returned data (hex string) */
  returnData: string;
}

/**
 * Configuration options for multicall operations
 */
export interface MulticallOptions {
  /** Custom Multicall3 contract address (optional) */
  multicallAddress?: string;
  /** If true, reverts the entire batch if any call fails (default: false) */
  requireSuccess?: boolean;
}

/**
 * Aggregates multiple smart contract calls into a single call using Multicall3.
 *
 * This function batches multiple contract calls into one RPC request, significantly
 * reducing network latency and improving performance for bulk data fetching operations.
 *
 * **Behavior:**
 * - By default, allows partial failures (individual calls can fail without reverting the batch)
 * - Set `requireSuccess: true` to revert the entire batch if any call fails
 * - Returns success status and data for each call
 *
 * @param calls - Array of calls to execute, each with target address and encoded call data
 * @param provider - The connected JSON-RPC provider
 * @param options - Optional configuration (multicall address, requireSuccess)
 *
 * @returns Promise resolving to an array of call results with success status and return data
 *
 * @throws {Error} If the multicall contract call fails or if requireSuccess is true and any call fails
 *
 * @example
 * ```typescript
 * // Get balances for multiple addresses in one call
 * const calls = addresses.map(addr => ({
 *   target: tokenAddress,
 *   callData: encodeCall(erc20Abi, 'balanceOf', [addr])
 * }));
 *
 * const results = await aggregate(calls, provider);
 * results.forEach((result, i) => {
 *   if (result.success) {
 *     const balance = decodeResult(erc20Abi, 'balanceOf', result.returnData);
 *     console.log(`Address ${addresses[i]}: ${balance}`);
 *   }
 * });
 * ```
 */
export async function aggregate(
  calls: Call[],
  provider: JsonRpcProvider,
  options: MulticallOptions = {}
): Promise<CallResult[]> {
  const {
    multicallAddress = DEFAULT_MULTICALL3_ADDRESS,
    requireSuccess = false,
  } = options;

  const multicall = new Contract(multicallAddress, MULTICALL3_ABI, provider);

  try {
    const results: unknown = await multicall["tryAggregate"]?.(
      requireSuccess,
      calls
    );

    // Type guard: ensure results is an array
    if (!Array.isArray(results)) {
      throw new Error("Unexpected multicall response format");
    }

    return results.map((r: unknown) => {
      // Type guard for result structure
      if (
        typeof r === "object" &&
        r !== null &&
        "success" in r &&
        "returnData" in r
      ) {
        return {
          success: Boolean((r as { success: unknown }).success),
          returnData: String((r as { returnData: unknown }).returnData),
        };
      }
      throw new Error("Invalid result format from multicall");
    });
  } catch (error) {
    throw new Error(
      `Multicall failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Encodes a function call into call data for use in multicall or direct transactions.
 *
 * This helper function takes a contract ABI, method name, and arguments, and returns
 * the encoded call data that can be used in a multicall batch or sent directly to a contract.
 *
 * @param abi - The contract ABI (can be full ABI or human-readable format)
 * @param method - The name of the function to call
 * @param args - Array of arguments to pass to the function (default: empty array)
 *
 * @returns The encoded call data as a hex string (e.g., "0x70a08231000000...")
 *
 * @throws {Error} If the method is not found in the ABI or encoding fails
 *
 * @example
 * ```typescript
 * // Encode a balanceOf call
 * const callData = encodeCall(
 *   ['function balanceOf(address) view returns (uint256)'],
 *   'balanceOf',
 *   ['0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb']
 * );
 * ```
 */
export function encodeCall(
  abi: InterfaceAbi,
  method: string,
  args: unknown[] = []
): string {
  const iface = new Interface(abi);
  return iface.encodeFunctionData(method, args);
}

/**
 * Decodes a function return value from raw call data.
 *
 * This helper function takes a contract ABI, method name, and the raw return data
 * (typically from a multicall result), and decodes it into the actual return values.
 *
 * @param abi - The contract ABI (can be full ABI or human-readable format)
 * @param method - The name of the function that was called
 * @param data - The raw return data as a hex string
 *
 * @returns The decoded result (type depends on the function's return type)
 *          - For single return values: the value itself
 *          - For multiple return values: an array-like object with named properties
 *
 * @throws {Error} If the method is not found in the ABI or decoding fails
 *
 * @example
 * ```typescript
 * // Decode a balanceOf result
 * const balance = decodeResult(
 *   ['function balanceOf(address) view returns (uint256)'],
 *   'balanceOf',
 *   '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000'
 * );
 * console.log(balance.toString()); // "1000000000000000000"
 * ```
 */
export function decodeResult(
  abi: InterfaceAbi,
  method: string,
  data: string
): unknown {
  const iface = new Interface(abi);
  const result = iface.decodeFunctionResult(method, data);
  // Return the first element if it's a single return value, otherwise return the full result
  return result.length === 1 ? result[0] : result;
}
