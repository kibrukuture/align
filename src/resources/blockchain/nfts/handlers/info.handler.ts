/**
 * NFT Information Handlers
 *
 * Internal handlers for querying NFT ownership and balance information.
 * These functions handle the low-level contract interactions for ERC-721 and ERC-1155 queries.
 *
 * **Standards Supported:**
 * - ERC-721: ownerOf queries for unique token ownership
 * - ERC-1155: balanceOf queries for token balance checks
 *
 * @module nfts/handlers/info
 */
import { Contract, JsonRpcProvider } from "ethers";

/**
 * Minimal ABI for ERC-721 ownership queries
 * @constant
 */
export const ERC721_OWNER_ABI = [
  "function ownerOf(uint256 tokenId) view returns (address)",
] as const;

/**
 * Minimal ABI for ERC-1155 balance queries
 * @constant
 */
export const ERC1155_BALANCE_ABI = [
  "function balanceOf(address account, uint256 id) view returns (uint256)",
] as const;

/**
 * Gets the current owner of an ERC-721 NFT.
 *
 * This function queries the blockchain to find who currently owns a specific NFT
 * by calling the ERC-721 `ownerOf` function. This is a read-only operation that
 * doesn't require gas or wallet signing.
 *
 * **Implementation Details:**
 * - Creates a read-only contract instance
 * - Calls the `ownerOf` view function
 * - Returns the checksummed Ethereum address of the owner
 *
 * **Behavior:**
 * - Does not require gas (view function)
 * - Returns immediately with the owner address
 * - Reverts if the token ID doesn't exist or was burned
 *
 * @param contractAddress - The ERC-721 contract address
 * @param tokenId - The token ID to query
 * @param provider - The connected JSON-RPC provider
 *
 * @returns Promise resolving to the owner's address (checksummed)
 *
 * @throws {Error} If the token doesn't exist, was burned, or the query fails
 *
 * @internal This is an internal handler called by the NFTs resource
 *
 * @example
 * ```typescript
 * const owner = await getERC721Owner(
 *   '0x...', // NFT contract
 *   '123',   // Token ID
 *   provider
 * );
 * console.log(`Owner: ${owner}`);
 * ```
 */
export async function getERC721Owner(
  contractAddress: string,
  tokenId: string,
  provider: JsonRpcProvider
): Promise<string> {
  const contract = new Contract(contractAddress, ERC721_OWNER_ABI, provider);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const owner: unknown = await contract["ownerOf"]?.(tokenId);

  // Type guard for address string
  if (typeof owner === "string") {
    return owner;
  }

  throw new Error("Failed to get NFT owner or invalid response");
}

/**
 * Checks if an address owns any amount of an ERC-1155 token.
 *
 * This function queries the blockchain to check if a specific address has a non-zero
 * balance of an ERC-1155 token ID. It calls the `balanceOf` function and returns
 * true if the balance is greater than zero.
 *
 * **Implementation Details:**
 * - Creates a read-only contract instance
 * - Calls the `balanceOf` view function
 * - Compares the balance against zero
 *
 * **Behavior:**
 * - Does not require gas (view function)
 * - Returns immediately with a boolean result
 * - Returns false if the address has zero balance
 *
 * **Note:** This function only checks for ownership (balance > 0).
 * For the exact balance amount, use the generic `contracts.read` method
 * with the `balanceOf` function.
 *
 * @param contractAddress - The ERC-1155 contract address
 * @param owner - The address to check for ownership
 * @param tokenId - The token ID to check
 * @param provider - The connected JSON-RPC provider
 *
 * @returns Promise resolving to true if the address owns at least one token, false otherwise
 *
 * @throws {Error} If the query fails
 *
 * @internal This is an internal handler called by the NFTs resource
 *
 * @example
 * ```typescript
 * const isOwner = await isERC1155Owner(
 *   '0x...', // ERC-1155 contract
 *   '0x...', // Address to check
 *   '456',   // Token ID
 *   provider
 * );
 * console.log(`Owns token: ${isOwner}`);
 * ```
 */
export async function isERC1155Owner(
  contractAddress: string,
  owner: string,
  tokenId: string,
  provider: JsonRpcProvider
): Promise<boolean> {
  const contract = new Contract(contractAddress, ERC1155_BALANCE_ABI, provider);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const balance: unknown = await contract["balanceOf"]?.(owner, tokenId);

  // Type guard for bigint balance
  if (typeof balance === "bigint") {
    return balance > 0n;
  }

  throw new Error("Failed to get token balance or invalid response");
}
