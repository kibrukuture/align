import { HttpClient } from '@/core/http-client';
import { type AlignConfig, DEFAULT_CONFIG } from '@/core/config';
import { CustomersResource } from '@/resources/customers/customers.resource';
import { VirtualAccountsResource } from '@/resources/virtual-accounts/virtual-accounts.resource';
import { TransfersResource } from '@/resources/transfers/transfers.resource';
import { WebhooksResource } from '@/resources/webhooks/webhooks.resource';
import { ExternalAccountsResource } from '@/resources/external-accounts/external-accounts.resource';
import { WalletsResource } from '@/resources/wallets/wallets.resource';
import { FilesResource } from '@/resources/files/files.resource';
import { DevelopersResource } from '@/resources/developers/developers.resource';
import { CrossChainResource } from '@/resources/cross-chain/cross-chain.resource';
import { AlignError, AlignValidationError } from '@/core/errors';

export class AlignClient {
  private httpClient: HttpClient;

  public readonly customers: CustomersResource;
  public readonly virtualAccounts: VirtualAccountsResource;
  public readonly transfers: TransfersResource;
  public readonly webhooks: WebhooksResource;
  public readonly externalAccounts: ExternalAccountsResource;
  public readonly wallets: WalletsResource;
  public readonly files: FilesResource;
  public readonly developers: DevelopersResource;
  public readonly crossChain: CrossChainResource;

  constructor(config: AlignConfig) {
    this.httpClient = new HttpClient(config);
    
    // Initialize Resources
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

