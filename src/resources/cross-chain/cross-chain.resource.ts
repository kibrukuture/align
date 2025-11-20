import { HttpClient } from '@/core/http-client';
import type { 
  CreateCrossChainQuoteRequest, 
  CrossChainQuote, 
  CreateCrossChainTransferRequest,
  PermanentRoute,
  CrossChainTransfer
} from '@/resources/cross-chain/cross-chain.types';
import { CROSS_CHAIN_ENDPOINTS } from '@/constants';

export class CrossChainResource {
  constructor(private client: HttpClient) {}

  /**
   * Create a quote for transferring cryptocurrency across different blockchain networks
   * 
   * @param data - Cross-chain quote parameters
   * @param data.source_token - Source cryptocurrency token
   * @param data.source_network - Source blockchain network
   * @param data.destination_token - Destination cryptocurrency token
   * @param data.destination_network - Destination blockchain network
   * @param data.amount - Amount to transfer
   * @param data.is_source_amount - Whether the amount is for source (true) or destination (false)
   * @returns Promise resolving to the cross-chain quote with exchange rate and fees
   * 
   * @example
   * ```typescript
   * const quote = await align.crossChain.createQuote({
   *   source_token: 'usdc',
   *   source_network: 'ethereum',
   *   destination_token: 'usdc',
   *   destination_network: 'polygon',
   *   amount: '100.00',
   *   is_source_amount: true,
   * });
   * console.log(`Send ${quote.source_amount} USDC on Ethereum`);
   * console.log(`Receive ${quote.destination_amount} USDC on Polygon`);
   * ```
   */
  public async createQuote(data: CreateCrossChainQuoteRequest): Promise<CrossChainQuote> {
    return this.client.post<CrossChainQuote>(CROSS_CHAIN_ENDPOINTS.QUOTE, data);
  }

  /**
   * Execute a cross-chain transfer from a quote
   * 
   * @param data - Transfer execution parameters
   * @param data.quote_id - The quote ID from createQuote
   * @param data.destination_address - The destination wallet address
   * @returns Promise resolving to the created cross-chain transfer
   * 
   * @example
   * ```typescript
   * const transfer = await align.crossChain.createTransfer({
   *   quote_id: quote.quote_id,
   *   destination_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
   * });
   * console.log(transfer.id); // "cc_transfer_123"
   * ```
   */
  public async createTransfer(data: CreateCrossChainTransferRequest): Promise<CrossChainTransfer> {
    return this.client.post<CrossChainTransfer>(CROSS_CHAIN_ENDPOINTS.CREATE, data);
  }

  /**
   * Retrieve a cross-chain transfer by its unique identifier
   * 
   * @param id - The unique transfer identifier
   * @returns Promise resolving to the cross-chain transfer object
   * 
   * @example
   * ```typescript
   * const transfer = await align.crossChain.getTransfer('cc_transfer_123');
   * console.log(transfer.status); // "completed"
   * ```
   */
  public async getTransfer(id: string): Promise<CrossChainTransfer> {
    return this.client.get<CrossChainTransfer>(CROSS_CHAIN_ENDPOINTS.GET(id));
  }

  /**
   * Create a permanent deposit address for recurring cross-chain transfers
   * 
   * Any cryptocurrency sent to this address will automatically be bridged to the
   * destination network and sent to the specified destination address.
   * 
   * @param data - Permanent route configuration
   * @param data.source_token - Source cryptocurrency token
   * @param data.source_network - Source blockchain network
   * @param data.destination_token - Destination cryptocurrency token
   * @param data.destination_network - Destination blockchain network
   * @param data.deposit_address - Destination wallet address
   * @returns Promise resolving to the created permanent route with deposit address
   * 
   * @example
   * ```typescript
   * const route = await align.crossChain.createPermanentRoute({
   *   source_token: 'usdc',
   *   source_network: 'ethereum',
   *   destination_token: 'usdc',
   *   destination_network: 'solana',
   *   deposit_address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
   * });
   * console.log(`Deposit Address: ${route.deposit_address}`);
   * ```
   */
  public async createPermanentRoute(data: Omit<PermanentRoute, 'id'>): Promise<PermanentRoute> {
    return this.client.post<PermanentRoute>(CROSS_CHAIN_ENDPOINTS.CREATE_ROUTE, data);
  }

  /**
   * List all permanent cross-chain routes
   * 
   * @returns Promise resolving to an array of permanent routes
   * 
   * @example
   * ```typescript
   * const routes = await align.crossChain.listPermanentRoutes();
   * routes.forEach(route => {
   *   console.log(`${route.source_network} → ${route.destination_network}`);
   * });
   * ```
   */
  public async listPermanentRoutes(): Promise<PermanentRoute[]> {
    return this.client.get<PermanentRoute[]>(CROSS_CHAIN_ENDPOINTS.ROUTES);
  }
}
