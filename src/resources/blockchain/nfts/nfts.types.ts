/**
 * NFT Type Definitions
 *
 * TypeScript interfaces for NFT-related operations.
 * These types provide strict typing for ERC-721 and ERC-1155 interactions.
 *
 * @module nfts/types
 */
import type {
  Network,
  Wallet,
} from "@/resources/blockchain/wallets/wallets.types";

/**
 * Represents an NFT with its contract details.
 *
 * Can represent either ERC-721 or ERC-1155 tokens.
 */
export interface NFT {
  /** The NFT contract address */
  contractAddress: string;
  /** The token ID */
  tokenId: string;
  /** The network where the NFT exists */
  network: Network;
  /** The token standard (ERC-721 or ERC-1155) */
  type: "ERC721" | "ERC1155";
}

/**
 * Parameters for NFT transfer operations.
 *
 * Used for both ERC-721 and ERC-1155 transfers.
 */
export interface NFTTransfer {
  /** The wallet sending the NFT */
  wallet: Wallet;
  /** The NFT contract address */
  contractAddress: string;
  /** The token ID to transfer */
  tokenId: string;
  /** The recipient address */
  to: string;
  /** The amount to transfer (required for ERC-1155, ignored for ERC-721) */
  amount?: string;
  /** The network to execute the transfer on */
  network: Network;
}

/**
 * NFT metadata structure.
 *
 * Represents the metadata typically stored off-chain for NFTs.
 * Follows the common metadata standard used by most NFT platforms.
 */
export interface NFTMetadata {
  /** The name of the NFT */
  name?: string;
  /** A description of the NFT */
  description?: string;
  /** URL to the NFT image or media */
  image?: string;
  /** Array of trait/attribute objects */
  attributes?: Record<string, unknown>[];
}
