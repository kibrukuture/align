import {
  Contract,
  JsonRpcProvider,
  Wallet as EthersWallet,
  TransactionResponse,
} from "ethers";
import type { InterfaceAbi } from "ethers";
import type { Wallet } from "@/resources/blockchain/wallets/wallets.types";

/**
 * Calls a state-changing method on a smart contract.
 *
 * This function executes a contract method that modifies blockchain state, requiring
 * gas payment and wallet signing. It's used for operations like token transfers,
 * approvals, or any other state-changing contract interactions.
 *
 * **Behavior:**
 * - Requires a wallet with a private key for signing
 * - Consumes gas (paid by the wallet)
 * - Returns a transaction response immediately (not waiting for confirmation)
 * - Can send native tokens (ETH, MATIC, etc.) along with the call via the `value` parameter
 *
 * **Gas Considerations:**
 * - The wallet must have sufficient native tokens for gas
 * - Gas price and limit are estimated automatically by the provider
 * - Consider using `tx.wait()` on the result to wait for confirmation
 *
 * @param wallet - The wallet object containing the private key for signing
 * @param address - The contract address to interact with
 * @param abi - The contract ABI (can be full ABI or human-readable format)
 * @param method - The name of the state-changing function to call
 * @param args - Array of arguments to pass to the function (default: empty array)
 * @param value - Amount of native token to send with the transaction in wei (optional)
 * @param provider - The connected JSON-RPC provider
 *
 * @returns Promise resolving to a TransactionResponse object
 *          - Use `tx.wait()` to wait for confirmation
 *          - Use `tx.hash` to get the transaction hash
 *
 * @throws {Error} If the method doesn't exist in the ABI, execution fails, or wallet has insufficient funds
 *
 * @example
 * ```typescript
 * // Transfer ERC-20 tokens
 * const tx = await writeContract(
 *   wallet,
 *   '0x...', // Token address
 *   ['function transfer(address to, uint256 amount) returns (bool)'],
 *   'transfer',
 *   ['0x...', '1000000000000000000'], // recipient, amount (1 token with 18 decimals)
 *   undefined, // No native token value
 *   provider
 * );
 *
 * // Wait for confirmation
 * const receipt = await tx.wait();
 * console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
 * ```
 */
export async function writeContract(
  wallet: Wallet,
  address: string,
  abi: InterfaceAbi,
  method: string,
  args: unknown[] = [],
  value: string | undefined,
  provider: JsonRpcProvider
): Promise<TransactionResponse> {
  // Reconstruct the signer from the wallet object
  const signer = new EthersWallet(wallet.privateKey, provider);

  const contract = new Contract(address, abi, signer);

  // Build transaction overrides
  const overrides: { value?: string } = {};
  if (value) {
    overrides.value = value;
  }

  // Send the transaction
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const tx: unknown = await contract[method]?.(...args, overrides);

  // Type guard for transaction response
  if (typeof tx === "object" && tx !== null && "hash" in tx && "wait" in tx) {
    return tx as TransactionResponse;
  }

  throw new Error(`Method ${method} not found in ABI or failed to execute`);
}
