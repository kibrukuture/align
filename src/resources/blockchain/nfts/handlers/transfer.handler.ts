/**
 * NFT Transfer Handlers
 *
 * Internal handlers for executing ERC-721 and ERC-1155 NFT transfers.
 * These functions handle the low-level contract interactions for safe NFT transfers.
 *
 * **Standards Supported:**
 * - ERC-721: Non-fungible tokens (unique items)
 * - ERC-1155: Multi-token standard (fungible + non-fungible)
 *
 * @module nfts/handlers/transfer
 */
import {
  Contract,
  JsonRpcProvider,
  Wallet as EthersWallet,
  TransactionResponse,
} from "ethers";
import type { Wallet } from "@/resources/blockchain/wallets/wallets.types";

/**
 * Minimal ABI for ERC-721 transfers
 * @constant
 */
export const ERC721_TRANSFER_ABI = [
  "function safeTransferFrom(address from, address to, uint256 tokenId) external",
  "function transferFrom(address from, address to, uint256 tokenId) external",
] as const;

/**
 * Minimal ABI for ERC-1155 transfers
 * @constant
 */
export const ERC1155_TRANSFER_ABI = [
  "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data) external",
] as const;

/**
 * Transfers an ERC-721 NFT using the safeTransferFrom method.
 *
 * This function executes a safe transfer of a unique NFT from the wallet's address
 * to the recipient. It uses the ERC-721 `safeTransferFrom` method which includes
 * safety checks to prevent accidental transfers to contracts that don't support NFTs.
 *
 * **Implementation Details:**
 * - Creates a signer from the wallet's private key
 * - Calls `safeTransferFrom` on the NFT contract
 * - Reverts if the recipient is a contract without ERC-721 receiver implementation
 *
 * **Gas Considerations:**
 * - Requires gas payment (paid by the wallet)
 * - Gas cost varies by contract implementation
 * - Typically 50,000-100,000 gas for standard ERC-721
 *
 * @param wallet - The sender's wallet containing the NFT
 * @param contractAddress - The ERC-721 contract address
 * @param to - The recipient's address
 * @param tokenId - The unique token ID to transfer
 * @param provider - The connected JSON-RPC provider
 *
 * @returns Promise resolving to the submitted transaction response
 *
 * @throws {Error} If the wallet doesn't own the NFT, the transfer fails, or safeTransferFrom is not available
 *
 * @internal This is an internal handler called by the NFTs resource
 *
 * @example
 * ```typescript
 * const tx = await transferERC721(
 *   wallet,
 *   '0x...', // NFT contract
 *   '0x...', // Recipient
 *   '123',   // Token ID
 *   provider
 * );
 * ```
 */
export async function transferERC721(
  wallet: Wallet,
  contractAddress: string,
  to: string,
  tokenId: string,
  provider: JsonRpcProvider
): Promise<TransactionResponse> {
  const signer = new EthersWallet(wallet.privateKey, provider);
  const contract = new Contract(contractAddress, ERC721_TRANSFER_ABI, signer);

  // Use safeTransferFrom by default for safety checks
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const tx: unknown = await contract["safeTransferFrom"]?.(
    wallet.address,
    to,
    tokenId
  );

  // Type guard for transaction response
  if (typeof tx === "object" && tx !== null && "hash" in tx && "wait" in tx) {
    return tx as TransactionResponse;
  }

  throw new Error("Failed to execute safeTransferFrom");
}

/**
 * Transfers an ERC-1155 token using the safeTransferFrom method.
 *
 * This function executes a safe transfer of a specified amount of an ERC-1155 token
 * from the wallet's address to the recipient. ERC-1155 supports both fungible and
 * non-fungible tokens, allowing transfer of multiple copies of the same token ID.
 *
 * **Implementation Details:**
 * - Creates a signer from the wallet's private key
 * - Calls `safeTransferFrom` with amount and empty data parameter
 * - Includes safety checks for contract recipients
 *
 * **Gas Considerations:**
 * - Requires gas payment (paid by the wallet)
 * - Gas cost varies by contract implementation
 * - Typically 50,000-150,000 gas for standard ERC-1155
 *
 * @param wallet - The sender's wallet containing the tokens
 * @param contractAddress - The ERC-1155 contract address
 * @param to - The recipient's address
 * @param tokenId - The token ID to transfer
 * @param amount - The amount of tokens to transfer (as string to support large numbers)
 * @param provider - The connected JSON-RPC provider
 *
 * @returns Promise resolving to the submitted transaction response
 *
 * @throws {Error} If the wallet has insufficient balance, the transfer fails, or safeTransferFrom is not available
 *
 * @internal This is an internal handler called by the NFTs resource
 *
 * @example
 * ```typescript
 * const tx = await transferERC1155(
 *   wallet,
 *   '0x...', // ERC-1155 contract
 *   '0x...', // Recipient
 *   '456',   // Token ID
 *   '10',    // Amount
 *   provider
 * );
 * ```
 */
export async function transferERC1155(
  wallet: Wallet,
  contractAddress: string,
  to: string,
  tokenId: string,
  amount: string,
  provider: JsonRpcProvider
): Promise<TransactionResponse> {
  const signer = new EthersWallet(wallet.privateKey, provider);
  const contract = new Contract(contractAddress, ERC1155_TRANSFER_ABI, signer);

  // ERC-1155 requires a data parameter, sending empty bytes "0x"
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const tx: unknown = await contract["safeTransferFrom"]?.(
    wallet.address,
    to,
    tokenId,
    amount,
    "0x"
  );

  // Type guard for transaction response
  if (typeof tx === "object" && tx !== null && "hash" in tx && "wait" in tx) {
    return tx as TransactionResponse;
  }

  throw new Error("Failed to execute safeTransferFrom");
}
