/**
 * Token Validation Schemas
 * 
 * This file contains Zod schemas for validating token-related data:
 * - Token identifier validation (USDC, USDT, EURC)
 * - Token address validation (ERC-20 contract addresses)
 * - Token amount validation
 * - Token balance request validation
 * 
 * Used to ensure data integrity before token operations.
 */

import { z } from "zod/v4";
import { isAddress } from "ethers";
import { WalletAddressSchema } from "@/resources/blockchain/wallets/wallets.validator";
import { NetworkSchema, TokenSchema, AmountSchema } from "@/resources/blockchain/transactions/transactions.validator";

/**
 * Validates ERC-20 token contract address format
 * 
 * @param address - The token contract address to validate
 * @returns true if valid Ethereum address, false otherwise
 */
const isValidTokenAddress = (address: string): boolean => {
  return isAddress(address);
};

/**
 * Schema for validating token identifiers
 * 
 * Re-exported from transactions validator for consistency
 * 
 * @example
 * ```typescript
 * const token = TokenSchema.parse('usdc');
 * ```
 */
export { TokenSchema };

/**
 * Schema for validating token contract addresses
 * 
 * Token addresses must be valid Ethereum addresses
 * 
 * @example
 * ```typescript
 * const tokenAddress = TokenAddressSchema.parse('0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174');
 * ```
 */
export const TokenAddressSchema = z
  .string()
  .min(1, "Token address cannot be empty")
  .refine(isValidTokenAddress, {
    message: "Invalid token contract address format",
  });

/**
 * Schema for validating token amount requests
 * 
 * Re-exported from transactions validator for consistency
 * 
 * @example
 * ```typescript
 * const amount = TokenAmountSchema.parse('100.5');
 * ```
 */
export const TokenAmountSchema = AmountSchema;

/**
 * Schema for validating token balance requests
 * 
 * Used when querying token balances for an address
 * 
 * @example
 * ```typescript
 * const request = TokenBalanceRequestSchema.parse({
 *   address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
 *   token: 'usdc',
 *   network: 'polygon'
 * });
 * ```
 */
export const TokenBalanceRequestSchema = z.object({
  address: WalletAddressSchema,
  token: TokenSchema,
  network: NetworkSchema,
});

/**
 * Schema for validating token address lookup requests
 * 
 * Used when getting token contract address for a network
 * 
 * @example
 * ```typescript
 * const request = TokenAddressRequestSchema.parse({
 *   token: 'usdc',
 *   network: 'polygon'
 * });
 * ```
 */
export const TokenAddressRequestSchema = z.object({
  token: TokenSchema,
  network: NetworkSchema,
});

/**
 * Schema for validating token amount formatting requests
 * 
 * Used when formatting token amounts with decimals
 * 
 * @example
 * ```typescript
 * const request = TokenFormatRequestSchema.parse({
 *   amount: '1000000',
 *   decimals: 6
 * });
 * ```
 */
export const TokenFormatRequestSchema = z.object({
  amount: z.string().min(1, "Amount cannot be empty"),
  decimals: z.number().int().min(0).max(18, "Decimals must be between 0 and 18"),
});

/**
 * Schema for validating token info requests
 * 
 * Used when querying token information (name, symbol, decimals)
 * 
 * @example
 * ```typescript
 * const request = TokenInfoRequestSchema.parse({
 *   tokenAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
 *   network: 'polygon'
 * });
 * ```
 */
export const TokenInfoRequestSchema = z.object({
  tokenAddress: TokenAddressSchema,
  network: NetworkSchema,
});
