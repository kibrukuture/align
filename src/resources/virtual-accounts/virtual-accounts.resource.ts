import { HttpClient } from '@/core/http-client';
import { AlignValidationError } from '@/core/errors';
import type { CreateVirtualAccountRequest, VirtualAccount } from '@/resources/virtual-accounts/virtual-accounts.types';
import { CreateVirtualAccountSchema } from '@/resources/virtual-accounts/virtual-accounts.validator';
import { VIRTUAL_ACCOUNT_ENDPOINTS } from '@/constants';

export class VirtualAccountsResource {
  constructor(private client: HttpClient) {}

  /**
   * Create a new virtual account for a customer
   */
  public async create(data: CreateVirtualAccountRequest): Promise<VirtualAccount> {
    const validation = CreateVirtualAccountSchema.safeParse(data);
    if (!validation.success) {
      throw new AlignValidationError('Invalid virtual account data', validation.error.flatten().fieldErrors as Record<string, string[]>);
    }

    return this.client.post<VirtualAccount>(VIRTUAL_ACCOUNT_ENDPOINTS.CREATE, data);
  }

  /**
   * List all virtual accounts for a customer
   */
  public async list(): Promise<VirtualAccount[]> {
    return this.client.get<VirtualAccount[]>(VIRTUAL_ACCOUNT_ENDPOINTS.LIST);
  }

  /**
   * Get a specific virtual account
   */
  public async get(id: string): Promise<VirtualAccount> {
    return this.client.get<VirtualAccount>(VIRTUAL_ACCOUNT_ENDPOINTS.GET(id));
  }
}
