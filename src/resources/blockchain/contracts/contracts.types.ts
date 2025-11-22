/**
 * Contract Type Definitions
 *
 * TypeScript interfaces for generic smart contract interactions.
 * These types provide strict typing for contract calls, transactions, and event queries.
 *
 * @module contracts/types
 */
import type { InterfaceAbi } from "ethers";
import type {
  Network,
  Wallet,
} from "@/resources/blockchain/wallets/wallets.types";

/**
 * Parameters for read-only contract calls.
 *
 * Used for calling view/pure functions that don't modify blockchain state.
 */
export interface ContractCall {
  /** The contract address to call */
  address: string;
  /** The contract ABI (full or human-readable format) */
  abi: InterfaceAbi;
  /** The name of the view/pure function to call */
  method: string;
  /** Optional array of function arguments */
  args?: unknown[];
  /** The network to execute the call on */
  network: Network;
}

/**
 * Parameters for state-changing contract transactions.
 *
 * Extends ContractCall with wallet and value fields for transactions.
 */
export interface ContractTransaction extends ContractCall {
  /** The wallet to sign and send the transaction */
  wallet: Wallet;
  /** Optional amount of native token to send in wei */
  value?: string;
}

/**
 * Parameters for querying past contract events.
 *
 * Used for retrieving historical events from a contract within a block range.
 */
export interface ContractEventQuery {
  /** The contract address to query */
  address: string;
  /** The contract ABI containing the event definition */
  abi: InterfaceAbi;
  /** The name of the event to query */
  eventName: string;
  /** The network to query */
  network: Network;
  /** Optional array of indexed parameter values for filtering */
  filter?: unknown[];
  /** Starting block number or "earliest" (default: 0) */
  fromBlock?: number | string;
  /** Ending block number or "latest" (default: "latest") */
  toBlock?: number | string;
}

/**
 * Represents a contract event returned from a query.
 *
 * Contains the event data, block information, and transaction hash.
 */
export interface ContractEvent {
  /** The name of the event */
  eventName: string;
  /** Array of event arguments/parameters */
  args: unknown[];
  /** Block number where the event was emitted */
  blockNumber: number;
  /** Transaction hash that emitted the event */
  transactionHash: string;
}
