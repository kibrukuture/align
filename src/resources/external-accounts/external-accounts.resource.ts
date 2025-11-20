import { HttpClient } from '@/core/http-client';
import { AlignValidationError } from '@/core/errors';
import type { CreateExternalAccountRequest, ExternalAccount, ExternalAccountListResponse } from '@/resources/external-accounts/external-accounts.types';
import { CreateExternalAccountSchema } from '@/resources/external-accounts/external-accounts.validator';
import { EXTERNAL_ACCOUNT_ENDPOINTS } from '@/constants';

export class ExternalAccountsResource {
  constructor(private client: HttpClient) {}

  /**
   * Create an external bank account for a customer
   * 
   * Supports both US bank accounts (with routing/account numbers) and
   * international accounts (with IBAN/BIC).
   * 
   * @param customerId - The unique customer identifier (UUID)
   * @param data - External account information
   * @param data.bank_name - Name of the bank
   * @param data.account_holder_type - Account holder type: 'individual' or 'business'
   * @param data.account_holder_first_name - First name (for individual accounts)
   * @param data.account_holder_last_name - Last name (for individual accounts)
   * @param data.account_holder_business_name - Business name (for business accounts)
   * @param data.account_holder_address - Account holder's address
   * @param data.account_type - Account type: 'iban' or 'us'
   * @param data.iban - IBAN details (for IBAN accounts)
   * @param data.us - US account details (for US accounts)
   * @returns Promise resolving to the created external account
   * @throws {AlignValidationError} If the account data is invalid
   * 
   * @example
   * ```typescript
   * // IBAN account
   * const ibanAccount = await align.externalAccounts.create('123e4567-e89b-12d3-a456-426614174000', {
   *   bank_name: 'Deutsche Bank',
   *   account_holder_type: 'individual',
   *   account_holder_first_name: 'John',
   *   account_holder_last_name: 'Doe',
   *   account_holder_address: {
   *     country: 'DE',
   *     city: 'Berlin',
   *     street_line_1: 'Unter den Linden 1',
   *     postal_code: '10117',
   *   },
   *   account_type: 'iban',
   *   iban: {
   *     bic: 'DEUTDEFF',
   *     iban_number: 'DE89370400440532013000',
   *   },
   * });
   * 
   * // US account
   * const usAccount = await align.externalAccounts.create('123e4567-e89b-12d3-a456-426614174000', {
   *   bank_name: 'Chase Bank',
   *   account_holder_type: 'business',
   *   account_holder_business_name: 'Acme Corporation',
   *   account_holder_address: {
   *     country: 'US',
   *     city: 'San Francisco',
   *     street_line_1: '580 Howard, Suite PH',
   *     postal_code: '94105',
   *   },
   *   account_type: 'us',
   *   us: {
   *     account_number: '1234567890',
   *     routing_number: '021000021',
   *   },
   * });
   * ```
   */
  public async create(customerId: string, data: CreateExternalAccountRequest): Promise<ExternalAccount> {
    const validation = CreateExternalAccountSchema.safeParse(data);
    if (!validation.success) {
      throw new AlignValidationError('Invalid external account data', validation.error.flatten().fieldErrors as Record<string, string[]>);
    }

    return this.client.post<ExternalAccount>(EXTERNAL_ACCOUNT_ENDPOINTS.CREATE(customerId), data);
  }

  /**
   * List all external accounts for a customer
   * 
   * @param customerId - The unique customer identifier (UUID)
   * @returns Promise resolving to a list of external accounts
   * 
   * @example
   * ```typescript
   * const accounts = await align.externalAccounts.list('123e4567-e89b-12d3-a456-426614174000');
   * accounts.items.forEach(account => {
   *   console.log(`${account.id}: ${account.bank_name} (${account.account_type})`);
   * });
   * ```
   */
  public async list(customerId: string): Promise<ExternalAccountListResponse> {
    return this.client.get<ExternalAccountListResponse>(EXTERNAL_ACCOUNT_ENDPOINTS.LIST(customerId));
  }
}
