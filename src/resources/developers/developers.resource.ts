import { HttpClient } from '@/core/http-client';
import type { DeveloperFee } from '@/resources/developers/developers.types';
import { DEVELOPER_ENDPOINTS } from '@/constants';

export class DevelopersResource {
  constructor(private client: HttpClient) {}

  /**
   * Retrieve current developer fee settings
   * 
   * Developer fees allow you to earn a percentage on each transaction processed
   * through your integration.
   * 
   * @returns Promise resolving to an array of developer fee configurations
   * 
   * @example
   * ```typescript
   * const fees = await align.developers.getFees();
   * fees.forEach(fee => {
   *   console.log(`Fee: ${fee.percent}% to wallet ${fee.wallet_address}`);
   * });
   * ```
   */
  public async getFees(): Promise<DeveloperFee[]> {
    return this.client.get<DeveloperFee[]>(DEVELOPER_ENDPOINTS.GET_FEES);
  }

  /**
   * Update developer fee settings
   * 
   * Configure the percentage fee you want to earn on transactions and the
   * wallet address where fees should be sent.
   * 
   * @param fees - Array of developer fee configurations
   * @returns Promise resolving to the updated developer fee settings
   * 
   * @example
   * ```typescript
   * const updatedFees = await align.developers.updateFees([
   *   {
   *     id: 'fee_123',
   *     percent: '0.5',
   *     wallet_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
   *   },
   * ]);
   * console.log('Developer fees updated successfully');
   * ```
   */
  public async updateFees(fees: DeveloperFee[]): Promise<DeveloperFee[]> {
    return this.client.post<DeveloperFee[]>(DEVELOPER_ENDPOINTS.UPDATE_FEES, { fees });
  }
}
