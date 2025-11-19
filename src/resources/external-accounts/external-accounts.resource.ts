import { HttpClient } from '@/core/http-client';
import { AlignValidationError } from '@/core/errors';
import type { CreateExternalAccountRequest, ExternalAccount } from '@/resources/external-accounts/external-accounts.types';
import { CreateExternalAccountSchema } from '@/resources/external-accounts/external-accounts.validator';
import { EXTERNAL_ACCOUNT_ENDPOINTS } from '@/constants';

export class ExternalAccountsResource {
  constructor(private client: HttpClient) {}

  /**
   * Create a new external account
   */
  public async create(data: CreateExternalAccountRequest): Promise<ExternalAccount> {
    const validation = CreateExternalAccountSchema.safeParse(data);
    if (!validation.success) {
      throw new AlignValidationError('Invalid external account data', validation.error.flatten().fieldErrors as Record<string, string[]>);
    }

    return this.client.post<ExternalAccount>(EXTERNAL_ACCOUNT_ENDPOINTS.CREATE, data);
  }

  /**
   * Get an external account by ID
   */
  public async get(id: string): Promise<ExternalAccount> {
    return this.client.get<ExternalAccount>(EXTERNAL_ACCOUNT_ENDPOINTS.GET(id));
  }
}
