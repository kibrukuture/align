import { TransactionResponse } from "ethers";
import { AlignValidationError } from "@/core/errors";
import { formatZodError } from "@/core/validation";
import { Providers } from "@/resources/blockchain/providers/providers.resource";
import * as Handlers from "@/resources/blockchain/nfts/handlers";
import {
  NFTContractSchema,
  NFTTransferSchema,
} from "@/resources/blockchain/nfts/nfts.validator";
import type {
  Network,
  Wallet,
} from "@/resources/blockchain/wallets/wallets.types";

/**
 * NFTs
 *
 * The main entry point for NFT-related operations in the SDK.
 * This class acts as a facade/orchestrator that:
 * 1. Validates user inputs using Zod schemas
 * 2. Manages dependencies (like Providers)
 * 3. Delegates complex business logic to specialized handlers
 * 4. Standardizes error handling
 *
 * **Key Features:**
 * - ERC-721 NFT transfers (safeTransferFrom)
 * - ERC-1155 NFT transfers (safeTransferFrom with amount)
 * - Ownership verification (ownerOf for ERC-721, balanceOf for ERC-1155)
 * - Multi-network support
 *
 * **Supported Standards:**
 * - ERC-721: Non-fungible tokens (unique items)
 * - ERC-1155: Multi-token standard (fungible + non-fungible)
 *
 * @example
 * Initialize the resource
 * ```typescript
 * import Align from '@tolbel/align';
 *
 * const align = new Align({ apiKey: '...' });
 * const nfts = align.blockchain.nfts;
 * ```
 */
export class NFTs {
  /**
   * @param providers - The centralized provider manager
   */
  constructor(private providers: Providers) {}

  /**
   * Transfers an ERC-721 NFT using the safeTransferFrom method.
   *
   * This method safely transfers a unique NFT from the wallet's address to the recipient.
   * It uses the ERC-721 `safeTransferFrom` method which includes safety checks to prevent
   * accidental transfers to contracts that don't support NFTs.
   *
   * **Behavior:**
   * - Requires the wallet to own the NFT
   * - Requires gas payment (paid by the wallet)
   * - Returns immediately (doesn't wait for confirmation)
   * - Reverts if the recipient is a contract that doesn't implement ERC-721 receiver
   *
   * @param {Wallet} wallet - The sender's wallet containing the NFT
   * @param {string} contractAddress - The NFT contract address
   * @param {string} to - The recipient's address
   * @param {string} tokenId - The unique token ID to transfer
   * @param {Network} network - The network to execute the transfer on
   *
   * @returns {Promise<TransactionResponse>} The submitted transaction response
   *
   * @throws {AlignValidationError} If parameters are invalid or missing
   * @throws {Error} If the wallet doesn't own the NFT or the transfer fails
   *
   * @example
   * ```typescript
   * const tx = await align.blockchain.nfts.transferERC721(
   *   myWallet,
   *   '0x...', // NFT contract address
   *   '0x...', // Recipient address
   *   '123',   // Token ID
   *   'polygon'
   * );
   *
   * const receipt = await tx.wait();
   * console.log(`NFT transferred in block ${receipt.blockNumber}`);
   * ```
   */
  public async transferERC721(
    wallet: Wallet,
    contractAddress: string,
    to: string,
    tokenId: string,
    network: Network
  ): Promise<TransactionResponse> {
    const validation = NFTTransferSchema.safeParse({
      contractAddress,
      tokenId,
      network,
      wallet,
      to,
    });

    if (!validation.success) {
      throw new AlignValidationError(
        "Invalid NFT transfer request",
        formatZodError(validation.error)
      );
    }

    const provider = this.providers.getProvider(network);
    return Handlers.transferERC721(
      wallet,
      contractAddress,
      to,
      tokenId,
      provider
    );
  }

  /**
   * Transfers an ERC-1155 token using the safeTransferFrom method.
   *
   * This method safely transfers a specified amount of an ERC-1155 token from the wallet's
   * address to the recipient. ERC-1155 supports both fungible and non-fungible tokens,
   * so the amount parameter allows transferring multiple copies of the same token ID.
   *
   * **Behavior:**
   * - Requires the wallet to have sufficient balance of the token ID
   * - Requires gas payment (paid by the wallet)
   * - Returns immediately (doesn't wait for confirmation)
   * - Includes safety checks for contract recipients
   *
   * @param {Wallet} wallet - The sender's wallet containing the tokens
   * @param {string} contractAddress - The ERC-1155 contract address
   * @param {string} to - The recipient's address
   * @param {string} tokenId - The token ID to transfer
   * @param {string} amount - The amount of tokens to transfer (as string to support large numbers)
   * @param {Network} network - The network to execute the transfer on
   *
   * @returns {Promise<TransactionResponse>} The submitted transaction response
   *
   * @throws {AlignValidationError} If parameters are invalid or missing
   * @throws {Error} If the wallet has insufficient balance or the transfer fails
   *
   * @example
   * ```typescript
   * const tx = await align.blockchain.nfts.transferERC1155(
   *   myWallet,
   *   '0x...', // ERC-1155 contract address
   *   '0x...', // Recipient address
   *   '456',   // Token ID
   *   '10',    // Amount to transfer
   *   'polygon'
   * );
   *
   * const receipt = await tx.wait();
   * console.log(`Tokens transferred in block ${receipt.blockNumber}`);
   * ```
   */
  public async transferERC1155(
    wallet: Wallet,
    contractAddress: string,
    to: string,
    tokenId: string,
    amount: string,
    network: Network
  ): Promise<TransactionResponse> {
    const validation = NFTTransferSchema.safeParse({
      contractAddress,
      tokenId,
      network,
      wallet,
      to,
      amount,
    });

    if (!validation.success) {
      throw new AlignValidationError(
        "Invalid NFT transfer request",
        formatZodError(validation.error)
      );
    }

    const provider = this.providers.getProvider(network);
    return Handlers.transferERC1155(
      wallet,
      contractAddress,
      to,
      tokenId,
      amount,
      provider
    );
  }

  /**
   * Gets the current owner of an ERC-721 NFT.
   *
   * This method queries the blockchain to find who currently owns a specific NFT.
   * It calls the ERC-721 `ownerOf` function which returns the address of the owner.
   *
   * **Behavior:**
   * - Does not require gas (read-only operation)
   * - Returns immediately with the owner address
   * - Reverts if the token ID doesn't exist
   *
   * @param {string} contractAddress - The ERC-721 contract address
   * @param {string} tokenId - The token ID to query
   * @param {Network} network - The network to query
   *
   * @returns {Promise<string>} The owner's address (checksummed Ethereum address)
   *
   * @throws {AlignValidationError} If parameters are invalid or missing
   * @throws {Error} If the token doesn't exist or the query fails
   *
   * @example
   * ```typescript
   * const owner = await align.blockchain.nfts.getOwner(
   *   '0x...', // NFT contract address
   *   '123',   // Token ID
   *   'polygon'
   * );
   * console.log(`NFT owned by: ${owner}`);
   * ```
   */
  public async getOwner(
    contractAddress: string,
    tokenId: string,
    network: Network
  ): Promise<string> {
    const validation = NFTContractSchema.safeParse({
      contractAddress,
      tokenId,
      network,
    });

    if (!validation.success) {
      throw new AlignValidationError(
        "Invalid NFT request",
        formatZodError(validation.error)
      );
    }

    const provider = this.providers.getProvider(network);
    return Handlers.getERC721Owner(contractAddress, tokenId, provider);
  }

  /**
   * Checks if an address owns any amount of an ERC-1155 token.
   *
   * This method queries the blockchain to check if a specific address has a non-zero
   * balance of an ERC-1155 token ID. It calls the `balanceOf` function and returns
   * true if the balance is greater than zero.
   *
   * **Behavior:**
   * - Does not require gas (read-only operation)
   * - Returns immediately with a boolean result
   * - Returns false if the address has zero balance
   *
   * **Note:** For the exact balance amount, use the generic `contracts.read` method
   * with the `balanceOf` function.
   *
   * @param {string} contractAddress - The ERC-1155 contract address
   * @param {string} owner - The address to check for ownership
   * @param {string} tokenId - The token ID to check
   * @param {Network} network - The network to query
   *
   * @returns {Promise<boolean>} True if the address owns at least one token, false otherwise
   *
   * @throws {AlignValidationError} If parameters are invalid or missing
   * @throws {Error} If the query fails
   *
   * @example
   * ```typescript
   * const isOwner = await align.blockchain.nfts.isOwner(
   *   '0x...', // ERC-1155 contract address
   *   '0x...', // Address to check
   *   '456',   // Token ID
   *   'polygon'
   * );
   * console.log(`Owns token: ${isOwner}`);
   * ```
   */
  public async isOwner(
    contractAddress: string,
    owner: string,
    tokenId: string,
    network: Network
  ): Promise<boolean> {
    const validation = NFTContractSchema.safeParse({
      contractAddress,
      tokenId,
      network,
    });

    if (!validation.success) {
      throw new AlignValidationError(
        "Invalid NFT request",
        formatZodError(validation.error)
      );
    }

    const provider = this.providers.getProvider(network);
    return Handlers.isERC1155Owner(contractAddress, owner, tokenId, provider);
  }
}
