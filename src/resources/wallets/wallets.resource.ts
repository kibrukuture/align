import { HttpClient } from '@/core/http-client';
import type { VerifyWalletRequest, WalletVerification } from '@/resources/wallets/wallets.types';
import { WALLET_ENDPOINTS } from '@/constants';

import { AlignValidationError } from '@/core/errors';
import { VerifyWalletSchema } from '@/resources/wallets/wallets.validator';

export class WalletsResource {
  constructor(private client: HttpClient) {}

  /**
   * Verify ownership of a cryptocurrency wallet address
   * 
   * Generates a verification link that the customer can use to prove they own
   * the wallet by signing a message with their private key.
   * 
   * @param customerId - The unique customer identifier
   * @param walletAddress - The cryptocurrency wallet address to verify
   * @returns Promise resolving to the wallet verification object with verification link
   * @throws {AlignValidationError} If the wallet address is invalid
   * 
   * @example
   * ```typescript
   * const verification = await align.wallets.verifyOwnership(
   *   'cus_abc123',
   *   '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
   * );
   * console.log(verification.verification_flow_link);
   * // "https://verify.alignlabs.dev/wallet/..."
   * 
   * // User clicks the link and signs a message with their wallet
   * ```
   */
  public async verifyOwnership(customerId: string, walletAddress: string): Promise<WalletVerification> {
    const data: VerifyWalletRequest = { wallet_address: walletAddress };
    
    const validation = VerifyWalletSchema.safeParse(data);
    if (!validation.success) {
      throw new AlignValidationError('Invalid wallet data', validation.error.flatten().fieldErrors as Record<string, string[]>);
    }

    return this.client.post<WalletVerification>(WALLET_ENDPOINTS.VERIFY_OWNERSHIP(customerId), data);
  }
}
