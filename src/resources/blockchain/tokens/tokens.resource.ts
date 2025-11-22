import { AlignValidationError } from "@/core/errors";
import { formatZodError } from "@/core/validation";
import { Providers } from "@/resources/blockchain/providers/providers.resource";
import * as Handlers from "@/resources/blockchain/tokens/handlers";
import type {
  TokenBalance,
  TokenInfo,
} from "@/resources/blockchain/tokens/tokens.types";
import {
  TokenBalanceRequestSchema,
  TokenAddressRequestSchema,
} from "@/resources/blockchain/tokens/tokens.validator";
import type {
  Network,
  Token,
} from "@/resources/blockchain/wallets/wallets.types";
import type { JsonRpcProvider } from "ethers";
import { parseUnits } from "ethers";

/**
 * Tokens
 *
 * The main entry point for token-related operations in the SDK.
 * This class acts as a facade/orchestrator that:
 * 1. Validates user inputs using Zod schemas
 * 2. Manages dependencies (like Providers)
 * 3. Delegates complex business logic to specialized handlers
 * 4. Standardizes error handling
 *
 * **Key Features:**
 * - Token balance checking (USDC, USDT, etc.)
 * - Token address lookup
 * - Amount formatting and parsing
 *
 * @example
 * Initialize the resource
 * ```typescript
 * const sdk = new AlignSDK({ apiKey: '...' });
 * const tokens = sdk.blockchain.tokens;
 * ```
 */
export class Tokens {
  constructor(private providers: Providers) {}

  /**
   * Gets the balance of a specific token for an address
   *
   * @param {string} address - The wallet address to check
   * @param {Token} token - The token identifier (e.g., "usdc")
   * @param {Network} network - The network to query
   *
   * @returns {Promise<string>} The balance as a formatted string (e.g., "100.0")
   *
   * @throws {AlignValidationError} If inputs are invalid
   * @throws {Error} If balance check fails
   *
   * @example
   * ```typescript
   * const balance = await sdk.blockchain.tokens.getBalance(
   *   "0xAddress...",
   *   "usdc",
   *   "polygon"
   * );
   * console.log(`Balance: ${balance} USDC`);
   * ```
   */
  public async getBalance(
    address: string,
    token: Token,
    network: Network
  ): Promise<string> {
    // Validate inputs
    const validation = TokenBalanceRequestSchema.safeParse({
      address,
      token,
      network,
    });
    if (!validation.success) {
      throw new AlignValidationError(
        "Invalid balance request",
        formatZodError(validation.error)
      );
    }

    // Get provider
    const provider = this.providers.getProvider(network);

    // Resolve token contract address
    const tokenAddress = Handlers.getTokenAddress(token, network);

    // Call handler for complex logic
    return Handlers.getTokenBalance(address, tokenAddress, provider);
  }

  /**
   * Gets the contract address for a supported token
   *
   * @param {Token} token - The token identifier
   * @param {Network} network - The network
   *
   * @returns {string} The contract address
   *
   * @example
   * ```typescript
   * const address = sdk.blockchain.tokens.getAddress("usdc", "polygon");
   * ```
   */
  public getAddress(token: Token, network: Network): string {
    const validation = TokenAddressRequestSchema.safeParse({ token, network });
    if (!validation.success) {
      throw new AlignValidationError(
        "Invalid token address request",
        formatZodError(validation.error)
      );
    }

    return Handlers.getTokenAddress(token, network);
  }

  /**
   * Formats a raw token amount to a human-readable string
   *
   * @param {string} amount - Raw amount (e.g., "1000000")
   * @param {number} decimals - Token decimals (e.g., 6)
   *
   * @returns {string} Formatted amount (e.g., "1.0")
   *
   * @example
   * ```typescript
   * const formatted = sdk.blockchain.tokens.formatAmount("1000000", 6);
   * ```
   */
  public formatAmount(amount: string, decimals: number): string {
    return Handlers.formatBalance(amount, decimals);
  }

  /**
   * Parses a human-readable amount to a raw token amount
   *
   * @param {string} amount - Formatted amount (e.g., "1.0")
   * @param {number} decimals - Token decimals (e.g., 6)
   *
   * @returns {string} Raw amount (e.g., "1000000")
   *
   * @example
   * ```typescript
   * const raw = sdk.blockchain.tokens.parseAmount("1.0", 6);
   * ```
   */
  public parseAmount(amount: string, decimals: number): string {
    return parseUnits(amount, decimals).toString();
  }

  /**
   * Retrieves token metadata (name, symbol, decimals, etc.).
   *
   * @param tokenAddress - Contract address of the token.
   * @param provider     - Connected ethers.js provider for the network.
   * @param network      - Network identifier (e.g. "polygon").
   * @param token        - Optional known token identifier (usdc, usdt, …).
   *
   * @returns TokenInfo object with full metadata.
   *
   * @example
   * const info = await sdk.blockchain.tokens.getTokenInfo(
   *   "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
   *   provider,
   *   "polygon"
   * );
   */
  public async getTokenInfo(
    tokenAddress: string,
    provider: JsonRpcProvider,
    network: Network,
    token?: Token
  ): Promise<TokenInfo> {
    // No validation needed here – the handler performs its own checks.
    return Handlers.getTokenInfo(tokenAddress, provider, network, token);
  }
}
