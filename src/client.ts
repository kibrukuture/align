import { HttpClient } from '@/core/http-client';
import { type AlignConfig} from '@/core/config';
import { CustomersResource } from '@/resources/customers/customers.resource';
import { VirtualAccountsResource } from '@/resources/virtual-accounts/virtual-accounts.resource';
import { TransfersResource } from '@/resources/transfers/transfers.resource';
import { WebhooksResource } from '@/resources/webhooks/webhooks.resource';
import { ExternalAccountsResource } from '@/resources/external-accounts/external-accounts.resource';
import { WalletsResource } from '@/resources/wallets/wallets.resource';
import { FilesResource } from '@/resources/files/files.resource';
import { DevelopersResource } from '@/resources/developers/developers.resource';
import { CrossChainResource } from '@/resources/cross-chain/cross-chain.resource';
 

/**
 * Main SDK client for interacting with the AlignLab API.
 * 
 * Provides access to all AlignLab resources including customers, transfers,
 * virtual accounts, webhooks, and more.
 * 
 * @example
 * ```typescript
 * import Align from '@schnl/align';
 * 
 * const align = new Align({
 *   apiKey: process.env.ALIGNLAB_API_KEY!,
 *   environment: 'production',
 * });
 * 
 * // Create a customer
 * const customer = await align.customers.create({
 *   email: 'user@example.com',
 *   first_name: 'John',
 *   last_name: 'Doe',
 *   type: 'individual',
 * });
 * 
 * // Create an offramp transfer
 * const quote = await align.transfers.createOfframpQuote({
 *   source_amount: '100.00',
 *   source_token: 'usdc',
 *   source_network: 'polygon',
 *   destination_currency: 'usd',
 *   destination_payment_rails: 'ach',
 * });
 * ```
 */
export class Align {
  private httpClient: HttpClient;

  /** Customer management operations */
  public readonly customers: CustomersResource;
  
  /** Virtual account operations */
  public readonly virtualAccounts: VirtualAccountsResource;
  
  /** Transfer operations (onramp/offramp) */
  public readonly transfers: TransfersResource;
  
  /** Webhook management and signature verification */
  public readonly webhooks: WebhooksResource;
  
  /** External bank account operations */
  public readonly externalAccounts: ExternalAccountsResource;
  
  /** Wallet ownership verification */
  public readonly wallets: WalletsResource;
  
  /** File upload operations */
  public readonly files: FilesResource;
  
  /** Developer fee management */
  public readonly developers: DevelopersResource;
  
  /** Cross-chain transfer operations */
  public readonly crossChain: CrossChainResource;

  /**
   * Initialize the Align SDK client.
   * 
   * @param config - Configuration options for the SDK
   * @param config.apiKey - Your AlignLab API key
   * @param config.environment - 'sandbox' or 'production' (default: 'sandbox')
   * @param config.timeout - Request timeout in milliseconds (default: 30000)
   * @param config.baseUrl - Custom base URL for API requests (optional)
   */
  constructor(config: AlignConfig) {
    this.httpClient = new HttpClient(config);
    
    // Initialize all resource handlers
    this.customers = new CustomersResource(this.httpClient);
    this.virtualAccounts = new VirtualAccountsResource(this.httpClient);
    this.transfers = new TransfersResource(this.httpClient);
    this.webhooks = new WebhooksResource(this.httpClient);
    this.externalAccounts = new ExternalAccountsResource(this.httpClient);
    this.wallets = new WalletsResource(this.httpClient);
    this.files = new FilesResource(this.httpClient);
    this.developers = new DevelopersResource(this.httpClient);
    this.crossChain = new CrossChainResource(this.httpClient);
  }
}

export * from '@/core/config';
export * from '@/core/errors';
export * from '@/resources/customers/customers.types';
export * from '@/resources/virtual-accounts/virtual-accounts.types';
export * from '@/resources/transfers/transfers.types';
export * from '@/resources/webhooks/webhooks.types';
export * from '@/resources/external-accounts/external-accounts.types';
export * from '@/resources/wallets/wallets.types';

