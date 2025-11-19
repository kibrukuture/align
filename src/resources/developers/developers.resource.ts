import { HttpClient } from '@/core/http-client';
import type { DeveloperFee } from '@/resources/developers/developers.types';
import { DEVELOPER_ENDPOINTS } from '@/constants';

export class DevelopersResource {
  constructor(private client: HttpClient) {}

  public async getFees(): Promise<DeveloperFee[]> {
    return this.client.get<DeveloperFee[]>(DEVELOPER_ENDPOINTS.GET_FEES);
  }

  /**
   * Update developer fees
   */
  public async updateFees(fees: DeveloperFee[]): Promise<DeveloperFee[]> {
    return this.client.post<DeveloperFee[]>(DEVELOPER_ENDPOINTS.UPDATE_FEES, { fees });
  }
}
