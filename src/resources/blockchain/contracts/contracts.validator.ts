/**
 * Contract Validation Schemas
 *
 * Zod validation schemas for generic smart contract interactions.
 * These schemas ensure type safety and runtime validation for all contract operations.
 *
 * **Schemas Provided:**
 * - ContractCallSchema: For read-only contract calls
 * - ContractTransactionSchema: For state-changing transactions
 * - ContractEventQuerySchema: For querying past events
 *
 * @module contracts/validators
 */
import { z } from "zod";
import { NetworkSchema } from "@/resources/blockchain/wallets/wallets.validator";

/**
 * Schema for validating contract ABIs.
 *
 * Accepts either:
 * - Array of unknown objects (full ABI format)
 * - Array of strings (human-readable ABI format)
 *
 * @constant
 */
const AbiSchema = z.array(z.unknown()).or(z.array(z.string()));

/**
 * Schema for validating read-only contract calls.
 *
 * **Required Fields:**
 * - address: Contract address (must start with "0x")
 * - abi: Contract ABI (full or human-readable format)
 * - method: Function name to call
 * - network: Network to execute on
 *
 * **Optional Fields:**
 * - args: Array of function arguments
 *
 * @constant
 */
export const ContractCallSchema = z.object({
  address: z.string().startsWith("0x", "Invalid address format"),
  abi: AbiSchema,
  method: z.string().min(1, "Method name is required"),
  args: z.array(z.unknown()).optional(),
  network: NetworkSchema,
});

/**
 * Schema for validating state-changing contract transactions.
 *
 * Extends ContractCallSchema with additional fields for transactions:
 *
 * **Additional Required Fields:**
 * - wallet: Wallet object with address and private key
 *
 * **Additional Optional Fields:**
 * - value: Amount of native token to send (in wei)
 *
 * @constant
 */
export const ContractTransactionSchema = ContractCallSchema.extend({
  wallet: z.object({
    address: z.string(),
    privateKey: z.string(),
  }),
  value: z.string().optional(), // Value in wei
});

/**
 * Schema for validating contract event queries.
 *
 * **Required Fields:**
 * - address: Contract address (must start with "0x")
 * - abi: Contract ABI containing the event definition
 * - eventName: Name of the event to query
 * - network: Network to query
 *
 * **Optional Fields:**
 * - filter: Array of indexed parameter values for filtering
 * - fromBlock: Starting block number or "earliest" (default: 0)
 * - toBlock: Ending block number or "latest" (default: "latest")
 *
 * @constant
 */
export const ContractEventQuerySchema = z.object({
  address: z.string().startsWith("0x", "Invalid address format"),
  abi: AbiSchema,
  eventName: z.string().min(1, "Event name is required"),
  network: NetworkSchema,
  filter: z.array(z.unknown()).optional(),
  fromBlock: z.union([z.number(), z.string()]).optional(),
  toBlock: z.union([z.number(), z.string()]).optional(),
});
