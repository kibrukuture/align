import { HttpClient } from '@/core/http-client';
import { AlignValidationError } from '@/core/errors';
import type { 
  CreateVirtualAccountRequest, 
  VirtualAccount,
  VirtualAccountListResponse 
} from '@/resources/virtual-accounts/virtual-accounts.types';
import { CreateVirtualAccountSchema } from '@/resources/virtual-accounts/virtual-accounts.validator';
import { VIRTUAL_ACCOUNT_ENDPOINTS } from '@/constants';

export class VirtualAccountsResource {
  constructor(private client: HttpClient) {}

  /**
   * Create a new virtual bank account for receiving fiat payments
   * 
   * Virtual accounts allow customers to receive fiat currency payments that are automatically
   * converted to stablecoins (USDC/USDT) and sent to the specified blockchain address.
   * 
   * @param customerId - The unique identifier of the customer
   * @param data - Virtual account configuration
   * @param data.source_currency - Fiat currency: 'usd', 'eur', or 'aed'
   * @param data.source_rails - Optional, 'swift' for USD SWIFT payments
   * @param data.destination_token - Stablecoin: 'usdc' or 'usdt'
   * @param data.destination_network - Blockchain network
   * @param data.destination_address - Blockchain address where funds will be sent
   * @returns Promise resolving to the created virtual account with deposit instructions
   * @throws {AlignValidationError} If the virtual account data is invalid
   * 
   * @example
   * ```typescript
   * const virtualAccount = await align.virtualAccounts.create(customerId, {
   *   source_currency: 'eur',
   *   destination_token: 'usdc',
   *   destination_network: 'polygon',
   *   destination_address: '0x742d35...',
   * });
   * 
   * // Access deposit instructions
   * if (virtualAccount.deposit_instructions.currency === 'eur') {
   *   console.log(virtualAccount.deposit_instructions.iban.iban_number);
   * }
   * ```
   */
  public async create(customerId: string, data: CreateVirtualAccountRequest): Promise<VirtualAccount> {
    const validation = CreateVirtualAccountSchema.safeParse(data);
    if (!validation.success) {
      throw new AlignValidationError('Invalid virtual account data', validation.error.flatten().fieldErrors as Record<string, string[]>);
    }

    return this.client.post<VirtualAccount>(VIRTUAL_ACCOUNT_ENDPOINTS.CREATE(customerId), data);
  }

  /**
   * Retrieve a specific virtual account by its unique identifier
   * 
   * @param customerId - The unique identifier of the customer
   * @param virtualAccountId - The unique virtual account identifier
   * @returns Promise resolving to the virtual account with deposit instructions
   * 
   * @example
   * ```typescript
   * const account = await align.virtualAccounts.get(customerId, virtualAccountId);
   * console.log(account.status); // "active"
   * console.log(account.destination_token); // "usdc"
   * ```
   */
  public async get(customerId: string, virtualAccountId: string): Promise<VirtualAccount> {
    return this.client.get<VirtualAccount>(VIRTUAL_ACCOUNT_ENDPOINTS.GET(customerId, virtualAccountId));
  }

  /**
   * List all virtual accounts for a customer
   * 
   * @param customerId - The unique identifier of the customer
   * @returns Promise resolving to a list of virtual accounts
   * 
   * @example
   * ```typescript
   * const response = await align.virtualAccounts.list(customerId);
   * response.items.forEach(account => {
   *   console.log(`${account.destination_token.toUpperCase()} on ${account.destination_network}`);
   * });
   * ```
   */
  public async list(customerId: string): Promise<VirtualAccountListResponse> {
    return this.client.get<VirtualAccountListResponse>(VIRTUAL_ACCOUNT_ENDPOINTS.LIST(customerId));
  }
}
