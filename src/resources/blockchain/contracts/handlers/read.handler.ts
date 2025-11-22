import { Contract, JsonRpcProvider } from "ethers";
import type { InterfaceAbi } from "ethers";
import type { ContractEvent } from "@/resources/blockchain/contracts/contracts.types";

/**
 * Calls a read-only (view/pure) method on a smart contract.
 *
 * This function executes a read-only contract method that doesn't modify blockchain state.
 * It's used for querying contract data like balances, allowances, or other view functions.
 *
 * **Behavior:**
 * - Does not require gas or signing
 * - Returns immediately with the result
 * - Can be called on any contract with a valid ABI
 *
 * @param address - The contract address to call
 * @param abi - The contract ABI (can be full ABI or human-readable format)
 * @param method - The name of the view/pure function to call
 * @param args - Array of arguments to pass to the function (default: empty array)
 * @param provider - The connected JSON-RPC provider
 *
 * @returns Promise resolving to the function's return value (type depends on the function)
 *
 * @throws {Error} If the contract call fails or the method doesn't exist
 *
 * @example
 * ```typescript
 * // Call balanceOf on an ERC-20 token
 * const balance = await readContract(
 *   '0x...', // Token address
 *   ['function balanceOf(address) view returns (uint256)'],
 *   'balanceOf',
 *   ['0x...'], // User address
 *   provider
 * );
 * ```
 */
export async function readContract(
  address: string,
  abi: InterfaceAbi,
  method: string,
  args: unknown[] = [],
  provider: JsonRpcProvider
): Promise<unknown> {
  const contract = new Contract(address, abi, provider);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
  return contract[method]?.(...args);
}

/**
 * Queries past events emitted by a smart contract.
 *
 * This function retrieves historical events from a contract within a specified block range.
 * Events are filtered by name and optional indexed parameters.
 *
 * **Behavior:**
 * - Queries the blockchain for past events
 * - Supports filtering by indexed event parameters
 * - Returns structured event data with args, block number, and transaction hash
 *
 * **Performance Considerations:**
 * - Large block ranges may be slow or fail on some RPC providers
 * - Consider using smaller ranges or pagination for production use
 * - Some providers limit the maximum block range (e.g., 10,000 blocks)
 *
 * @param address - The contract address to query
 * @param abi - The contract ABI containing the event definition
 * @param eventName - The name of the event to query (must match ABI)
 * @param filter - Array of indexed parameter values to filter by (default: empty, no filter)
 * @param fromBlock - Starting block number or "earliest" (default: 0)
 * @param toBlock - Ending block number or "latest" (default: "latest")
 * @param provider - The connected JSON-RPC provider
 *
 * @returns Promise resolving to an array of event objects, each containing:
 *          - eventName: The name of the event
 *          - args: Array of event arguments
 *          - blockNumber: Block number where the event was emitted
 *          - transactionHash: Transaction hash that emitted the event
 *
 * @throws {Error} If the event is not found in the ABI or the query fails
 *
 * @example
 * ```typescript
 * // Get all Transfer events for a specific address
 * const events = await getEvents(
 *   '0x...', // Token address
 *   ['event Transfer(address indexed from, address indexed to, uint256 value)'],
 *   'Transfer',
 *   [null, '0x...'], // Filter: any sender, specific recipient
 *   0, // From block 0
 *   'latest', // To latest block
 *   provider
 * );
 * ```
 */
export async function getEvents(
  address: string,
  abi: InterfaceAbi,
  eventName: string,
  filter: unknown[] = [],
  fromBlock: number | string = 0,
  toBlock: number | string = "latest",
  provider: JsonRpcProvider
): Promise<ContractEvent[]> {
  const contract = new Contract(address, abi, provider);
  const eventFilter = contract.filters[eventName]?.(...filter);

  if (!eventFilter) {
    throw new Error(`Event ${eventName} not found in ABI`);
  }

  const events = await contract.queryFilter(eventFilter, fromBlock, toBlock);

  return events.map((e: unknown) => {
    // Type guard for event structure
    if (
      typeof e === "object" &&
      e !== null &&
      "blockNumber" in e &&
      "transactionHash" in e
    ) {
      const event = e as {
        eventName?: string;
        args?: unknown;
        blockNumber: number;
        transactionHash: string;
      };

      return {
        eventName: event.eventName || eventName,
        args: event.args ? Array.from(event.args as ArrayLike<unknown>) : [],
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
      };
    }
    throw new Error("Invalid event format");
  });
}
