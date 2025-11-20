import { HttpClient } from '@/core/http-client';
import type { 
  DeveloperFeesResponse,
  UpdateDeveloperFeesRequest 
} from '@/resources/developers/developers.types';
import { DEVELOPER_ENDPOINTS } from '@/constants';

export class DevelopersResource {
  constructor(private client: HttpClient) {}

  /**
   * Retrieve current developer fee settings
   * 
   * Developer fees allow you to earn a percentage on each transaction processed
   * through your integration. Fees are configured per service type (onramp, offramp,
   * cross-chain transfers).
   * 
   * @returns Promise resolving to developer fee configurations
   * 
   * @example
   * ```typescript
   * const response = await align.developers.getFees();
   * response.developer_receivable_fees.forEach(fee => {
   *   console.log(`${fee.service_type}: ${fee.value}% (${fee.accrual_basis})`);
   * });
   * ```
   */
  public async getFees(): Promise<DeveloperFeesResponse> {
    return this.client.get<DeveloperFeesResponse>(DEVELOPER_ENDPOINTS.GET_FEES);
  }

  /**
   * Update developer fee settings
   * 
   * Configure the percentage fee you want to earn on transactions for each
   * service type. Fees are calculated as a percentage of the transaction amount.
   * 
   * @param request - Developer fee configuration by service type
   * @param request.developer_receivable_fees - Fees by service type
   * @param request.developer_receivable_fees.onramp - Fee percentage for onramp transactions
   * @param request.developer_receivable_fees.offramp - Fee percentage for offramp transactions
   * @param request.developer_receivable_fees.cross_chain_transfer - Fee percentage for cross-chain transfers
   * @returns Promise resolving to the updated developer fee settings
   * 
   * @example
   * ```typescript
   * const response = await align.developers.updateFees({
   *   developer_receivable_fees: {
   *     onramp: 1,
   *     offramp: 1,
   *     cross_chain_transfer: 1,
   *   },
   * });
   * console.log('Developer fees updated successfully');
   * ```
   */
  public async updateFees(request: UpdateDeveloperFeesRequest): Promise<DeveloperFeesResponse> {
    return this.client.put<DeveloperFeesResponse>(DEVELOPER_ENDPOINTS.UPDATE_FEES, request);
  }
}
