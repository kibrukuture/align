/**
 * Tokens Resource
 *
 * This is a thin wrapper class that handles validation, orchestration, and error handling.
 * Complex business logic is delegated to handlers in the handlers/ folder.
 *
 * Responsibilities:
 * - Input validation (using Zod schemas)
 * - Error handling and formatting
 * - Orchestrating handler calls
 * - Simple data preparation
 *
 * Business logic (token balance queries, token info retrieval) is in handlers/.
 */

import { AlignValidationError } from "@/core/errors";
import { formatZodError } from "@/core/validation";
import { ProvidersResource } from "../providers/providers.resource";
import * as Handlers from "./handlers";
import type { TokenBalance } from "./tokens.types";
import {
  TokenBalanceRequestSchema,
  TokenAddressRequestSchema,
} from "./tokens.validator";
import type { Network, Token } from "../wallets/wallets.types";
import { parseUnits } from "ethers";

export class TokensResource {
  constructor(private providers: ProvidersResource) {}

  /**
   * Get token balance
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
    const tokenAddress = Handlers.getTokenAddressHandler(token, network);

    // Call handler for complex logic
    return Handlers.getTokenBalanceHandler(address, tokenAddress, provider);
  }

  /**
   * Get token contract address
   */
  public getAddress(token: Token, network: Network): string {
    const validation = TokenAddressRequestSchema.safeParse({ token, network });
    if (!validation.success) {
      throw new AlignValidationError(
        "Invalid token address request",
        formatZodError(validation.error)
      );
    }

    return Handlers.getTokenAddressHandler(token, network);
  }

  /**
   * Format token amount with decimals
   */
  public formatAmount(amount: string, decimals: number): string {
    return Handlers.formatBalanceHandler(amount, decimals);
  }

  /**
   * Parse token amount to raw format
   */
  public parseAmount(amount: string, decimals: number): string {
    return parseUnits(amount, decimals).toString();
  }
}
