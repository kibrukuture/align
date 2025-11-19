import { HttpClient } from '@/core/http-client';
import type { VerifyWalletRequest, WalletVerification } from '@/resources/wallets/wallets.types';
import { WALLET_ENDPOINTS } from '@/constants';

export class WalletsResource {
  constructor(private client: HttpClient) {}

  /**
   * Verify wallet ownership
   */
  public async verifyOwnership(customerId: string, walletAddress: string): Promise<WalletVerification> {
    const data: VerifyWalletRequest = { wallet_address: walletAddress };
    return this.client.post<WalletVerification>(WALLET_ENDPOINTS.VERIFY_OWNERSHIP(customerId), data);
  }
}
