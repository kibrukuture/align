/**
 * Tokens Module
 *
 * This module provides functionality for interacting with ERC-20 tokens.
 * It includes the main resource class, type definitions, validators, and low-level handlers.
 *
 * **Key Components:**
 * - {@link Tokens}: The main facade for token operations.
 * - {@link TokenBalance}: Type definition for token balance data.
 * - {@link TokenInfo}: Type definition for token metadata.
 *
 * @module Tokens
 *
 * Usage:
 * ```typescript
 * import { Tokens } from '@/resources/blockchain/tokens';
 * import type { TokenBalance, TokenInfo } from '@/resources/blockchain/tokens';
 * ```
 */

// Export the tokens resource class
export { Tokens } from "@/resources/blockchain/tokens/tokens.resource";

// Export token types
export * from "@/resources/blockchain/tokens/tokens.types";

// Export token validators
export * from "@/resources/blockchain/tokens/tokens.validator";

// Export handlers (for advanced use cases)
export * from "@/resources/blockchain/tokens/handlers";
