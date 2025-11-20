import { HttpClient } from '@/core/http-client';
import { AlignValidationError } from '@/core/errors';
import type { CreateVirtualAccountRequest, VirtualAccount } from '@/resources/virtual-accounts/virtual-accounts.types';
import { CreateVirtualAccountSchema } from '@/resources/virtual-accounts/virtual-accounts.validator';
import { VIRTUAL_ACCOUNT_ENDPOINTS } from '@/constants';

export class VirtualAccountsResource {
  constructor(private client: HttpClient) {}

  /**
   * Create a new virtual bank account for receiving fiat payments
   * 
   * Virtual accounts allow customers to receive fiat currency payments that are automatically
   * converted to stablecoins (USDC/USDT).
   * 
   * @param data - Virtual account configuration
   * @param data.currency - Fiat currency: 'usd', 'eur', or 'aed'
   * @param data.account_type - Account type: 'checking' or 'savings' (optional, defaults to 'checking')
   * @returns Promise resolving to the created virtual account with account and routing numbers
   * @throws {AlignValidationError} If the virtual account data is invalid
   * 
   * @example
   * ```typescript
   * const virtualAccount = await align.virtualAccounts.create({
   *   currency: 'usd',
   *   account_type: 'checking',
   * });
   * console.log(virtualAccount.account_number); // "1234567890"
   * console.log(virtualAccount.routing_number); // "021000021"
   * ```
   */
  public async create(data: CreateVirtualAccountRequest): Promise<VirtualAccount> {
    const validation = CreateVirtualAccountSchema.safeParse(data);
    if (!validation.success) {
      throw new AlignValidationError('Invalid virtual account data', validation.error.flatten().fieldErrors as Record<string, string[]>);
    }

    return this.client.post<VirtualAccount>(VIRTUAL_ACCOUNT_ENDPOINTS.CREATE, data);
  }

  /**
   * List all virtual accounts for the authenticated customer
   * 
   * @returns Promise resolving to an array of virtual accounts
   * 
   * @example
   * ```typescript
   * const accounts = await align.virtualAccounts.list();
   * accounts.forEach(account => {
   *   console.log(`${account.currency.toUpperCase()}: ${account.account_number}`);
   * });
   * ```
   */
  public async list(): Promise<VirtualAccount[]> {
    return this.client.get<VirtualAccount[]>(VIRTUAL_ACCOUNT_ENDPOINTS.LIST);
  }

  /**
   * Retrieve a specific virtual account by its unique identifier
   * 
   * @param id - The unique virtual account identifier
   * @returns Promise resolving to the virtual account object
   * 
   * @example
   * ```typescript
   * const account = await align.virtualAccounts.get('va_abc123');
   * console.log(account.status); // "active"
   * console.log(account.currency); // "usd"
   * ```
   */
  public async get(id: string): Promise<VirtualAccount> {
    return this.client.get<VirtualAccount>(VIRTUAL_ACCOUNT_ENDPOINTS.GET(id));
  }
}
