import { HttpClient } from '@/core/http-client';
import { AlignValidationError } from '@/core/errors';
import type { CreateExternalAccountRequest, ExternalAccount } from '@/resources/external-accounts/external-accounts.types';
import { CreateExternalAccountSchema } from '@/resources/external-accounts/external-accounts.validator';
import { EXTERNAL_ACCOUNT_ENDPOINTS } from '@/constants';

export class ExternalAccountsResource {
  constructor(private client: HttpClient) {}

  /**
   * Link an external bank account for fiat transfers
   * 
   * Supports both US bank accounts (with routing/account numbers) and
   * international accounts (with IBAN/BIC).
   * 
   * @param data - External account information
   * @param data.account_holder_name - Name on the bank account
   * @param data.account_holder_type - Account holder type: 'individual' or 'business'
   * @param data.currency - Account currency: 'usd', 'eur', or 'aed'
   * @param data.country - Two-letter country code (e.g., 'US', 'DE')
   * @param data.address - Account holder's address
   * @param data.iban_details - IBAN and BIC for international accounts (optional)
   * @param data.us_details - Routing and account number for US accounts (optional)
   * @returns Promise resolving to the created external account
   * @throws {AlignValidationError} If the account data is invalid
   * 
   * @example
   * ```typescript
   * // US bank account
   * const account = await align.externalAccounts.create({
   *   account_holder_name: 'John Doe',
   *   account_holder_type: 'individual',
   *   currency: 'usd',
   *   country: 'US',
   *   address: {
   *     street: '123 Main St',
   *     city: 'New York',
   *     state: 'NY',
   *     postal_code: '10001',
   *     country: 'US',
   *   },
   *   us_details: {
   *     account_number: '1234567890',
   *     routing_number: '021000021',
   *     account_type: 'checking',
   *   },
   * });
   * console.log(account.id); // "ext_acc_123"
   * ```
   */
  public async create(data: CreateExternalAccountRequest): Promise<ExternalAccount> {
    const validation = CreateExternalAccountSchema.safeParse(data);
    if (!validation.success) {
      throw new AlignValidationError('Invalid external account data', validation.error.flatten().fieldErrors as Record<string, string[]>);
    }

    return this.client.post<ExternalAccount>(EXTERNAL_ACCOUNT_ENDPOINTS.CREATE, data);
  }

  /**
   * Retrieve an external account by its unique identifier
   * 
   * @param id - The unique external account identifier
   * @returns Promise resolving to the external account object
   * 
   * @example
   * ```typescript
   * const account = await align.externalAccounts.get('ext_acc_123');
   * console.log(account.status); // "verified"
   * ```
   */
  public async get(id: string): Promise<ExternalAccount> {
    return this.client.get<ExternalAccount>(EXTERNAL_ACCOUNT_ENDPOINTS.GET(id));
  }
}
