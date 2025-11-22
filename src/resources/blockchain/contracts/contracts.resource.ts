import { TransactionResponse } from "ethers";
import type { InterfaceAbi } from "ethers";

import { AlignValidationError } from "@/core/errors";
import { formatZodError } from "@/core/validation";
import { Providers } from "@/resources/blockchain/providers/providers.resource";
import * as Handlers from "@/resources/blockchain/contracts/handlers";
import {
  ContractCallSchema,
  ContractTransactionSchema,
  ContractEventQuerySchema,
} from "@/resources/blockchain/contracts/contracts.validator";
import type {
  Network,
  Wallet,
} from "@/resources/blockchain/wallets/wallets.types";

import type {
  ContractEvent,
  ContractCall,
  ContractTransaction,
  ContractEventQuery,
} from "@/resources/blockchain/contracts/contracts.types";

/**
 * Contracts
 *
 * The main entry point for generic smart contract interactions in the SDK.
 * This class acts as a facade/orchestrator that:
 * 1. Validates user inputs using Zod schemas
 * 2. Manages dependencies (like Providers)
 * 3. Delegates complex business logic to specialized handlers
 * 4. Standardizes error handling
 *
 * **Key Features:**
 * - Read-only contract calls (view/pure functions)
 * - State-changing contract transactions
 * - Event querying with filtering support
 * - Generic ABI support for any contract
 *
 * **Use Cases:**
 * - Interact with custom contracts not covered by specialized resources
 * - Query contract state (balances, allowances, etc.)
 * - Execute contract methods (transfers, approvals, etc.)
 * - Monitor contract events
 *
 * @example
 * Initialize the resource
 * ```typescript
 * const sdk = new AlignSDK({ apiKey: '...' });
 * const contracts = sdk.blockchain.contracts;
 * ```
 */
export class Contracts {
  constructor(private providers: Providers) {}

  /**
   * Calls a read-only (view/pure) method on a smart contract.
   *
   * This method executes a contract function that doesn't modify blockchain state.
   * It's ideal for querying contract data like balances, allowances, or configuration.
   *
   * **Behavior:**
   * - Does not require gas or wallet signing
   * - Returns immediately with the result
   * - Can be called on any contract with a valid ABI
   * - Supports both full ABIs and human-readable format
   *
   * @param {ContractCall} params - The contract call parameters
   * @param {string} params.address - The contract address to call
   * @param {InterfaceAbi} params.abi - The contract ABI (full or human-readable)
   * @param {string} params.method - The name of the view/pure function to call
   * @param {unknown[]} [params.args] - Array of arguments to pass to the function
   * @param {Network} params.network - The network to execute the call on
   *
   * @returns {Promise<unknown>} The function's return value (type depends on the function)
   *
   * @throws {AlignValidationError} If parameters are invalid or missing
   * @throws {Error} If the contract call fails or the method doesn't exist
   *
   * @example
   * ```typescript
   * // Query ERC-20 token balance
   * const balance = await sdk.blockchain.contracts.read({
   *   address: '0x...', // Token contract
   *   abi: ['function balanceOf(address) view returns (uint256)'],
   *   method: 'balanceOf',
   *   args: ['0x...'], // User address
   *   network: 'polygon'
   * });
   * console.log(`Balance: ${balance.toString()}`);
   * ```
   */
  public async read(params: ContractCall): Promise<unknown> {
    const validation = ContractCallSchema.safeParse(params);

    if (!validation.success) {
      throw new AlignValidationError(
        "Invalid contract read request",
        formatZodError(validation.error)
      );
    }

    const provider = this.providers.getProvider(params.network);
    return Handlers.readContract(
      params.address,
      params.abi,
      params.method,
      params.args,
      provider
    );
  }

  /**
   * Calls a state-changing method on a smart contract.
   *
   * This method executes a contract function that modifies blockchain state, requiring
   * gas payment and wallet signing. Use this for operations like token transfers,
   * approvals, or any other state-changing interactions.
   *
   * **Behavior:**
   * - Requires a wallet with a private key for signing
   * - Consumes gas (paid by the wallet)
   * - Returns a transaction response immediately (not waiting for confirmation)
   * - Can send native tokens (ETH, MATIC, etc.) along with the call
   *
   * **Gas Considerations:**
   * - The wallet must have sufficient native tokens for gas
   * - Gas price and limit are estimated automatically
   * - Use `tx.wait()` on the result to wait for confirmation
   *
   * @param {ContractTransaction} params - The contract transaction parameters
   * @param {Wallet} params.wallet - The wallet to sign and send the transaction
   * @param {string} params.address - The contract address to interact with
   * @param {InterfaceAbi} params.abi - The contract ABI (full or human-readable)
   * @param {string} params.method - The name of the state-changing function to call
   * @param {unknown[]} [params.args] - Array of arguments to pass to the function
   * @param {string} [params.value] - Amount of native token to send in wei (optional)
   * @param {Network} params.network - The network to execute the transaction on
   *
   * @returns {Promise<TransactionResponse>} The submitted transaction response
   *          - Use `tx.wait()` to wait for confirmation
   *          - Use `tx.hash` to get the transaction hash
   *
   * @throws {AlignValidationError} If parameters are invalid or missing
   * @throws {Error} If the transaction fails, method doesn't exist, or wallet has insufficient funds
   *
   * @example
   * ```typescript
   * // Transfer ERC-20 tokens
   * const tx = await sdk.blockchain.contracts.write({
   *   wallet: myWallet,
   *   address: '0x...', // Token contract
   *   abi: ['function transfer(address to, uint256 amount) returns (bool)'],
   *   method: 'transfer',
   *   args: ['0x...', '1000000000000000000'], // recipient, 1 token
   *   network: 'polygon'
   * });
   *
   * // Wait for confirmation
   * const receipt = await tx.wait();
   * console.log(`Confirmed in block ${receipt.blockNumber}`);
   * ```
   */
  public async write(
    params: ContractTransaction
  ): Promise<TransactionResponse> {
    const validation = ContractTransactionSchema.safeParse(params);

    if (!validation.success) {
      throw new AlignValidationError(
        "Invalid contract write request",
        formatZodError(validation.error)
      );
    }

    const provider = this.providers.getProvider(params.network);
    return Handlers.writeContract(
      params.wallet,
      params.address,
      params.abi,
      params.method,
      params.args,
      params.value,
      provider
    );
  }

  /**
   * Queries past events emitted by a smart contract.
   *
   * This method retrieves historical events from a contract within a specified block range.
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
   * @param {ContractEventQuery} params - The event query parameters
   * @param {string} params.address - The contract address to query
   * @param {InterfaceAbi} params.abi - The contract ABI containing the event definition
   * @param {string} params.eventName - The name of the event to query (must match ABI)
   * @param {unknown[]} [params.filter] - Array of indexed parameter values to filter by
   * @param {number | string} [params.fromBlock=0] - Starting block number or "earliest"
   * @param {number | string} [params.toBlock="latest"] - Ending block number or "latest"
   * @param {Network} params.network - The network to query
   *
   * @returns {Promise<ContractEvent[]>} Array of event objects, each containing:
   *          - eventName: The name of the event
   *          - args: Array of event arguments
   *          - blockNumber: Block number where the event was emitted
   *          - transactionHash: Transaction hash that emitted the event
   *
   * @throws {AlignValidationError} If parameters are invalid or missing
   * @throws {Error} If the event is not found in the ABI or the query fails
   *
   * @example
   * ```typescript
   * // Get all Transfer events for a specific recipient
   * const events = await sdk.blockchain.contracts.getEvents({
   *   address: '0x...', // Token contract
   *   abi: ['event Transfer(address indexed from, address indexed to, uint256 value)'],
   *   eventName: 'Transfer',
   *   filter: [null, '0x...'], // Any sender, specific recipient
   *   fromBlock: 0,
   *   toBlock: 'latest',
   *   network: 'polygon'
   * });
   *
   * events.forEach(event => {
   *   console.log(`Transfer: ${event.args[2]} tokens`);
   * });
   * ```
   */
  public async getEvents(params: ContractEventQuery): Promise<ContractEvent[]> {
    const validation = ContractEventQuerySchema.safeParse(params);

    if (!validation.success) {
      throw new AlignValidationError(
        "Invalid contract event query",
        formatZodError(validation.error)
      );
    }

    const provider = this.providers.getProvider(params.network);
    return Handlers.getEvents(
      params.address,
      params.abi,
      params.eventName,
      params.filter,
      params.fromBlock,
      params.toBlock,
      provider
    );
  }
}
