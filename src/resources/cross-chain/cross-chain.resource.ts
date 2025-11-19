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
   * Create a quote for cross-chain transfer
   */
  public async createQuote(data: CreateCrossChainQuoteRequest): Promise<CrossChainQuote> {
    return this.client.post<CrossChainQuote>(CROSS_CHAIN_ENDPOINTS.QUOTE, data);
  }

  /**
   * Execute a cross-chain transfer from a quote
   */
  public async createTransfer(data: CreateCrossChainTransferRequest): Promise<CrossChainTransfer> {
    return this.client.post<CrossChainTransfer>(CROSS_CHAIN_ENDPOINTS.CREATE, data);
  }

  /**
   * Get a cross-chain transfer by ID
   */
  public async getTransfer(id: string): Promise<CrossChainTransfer> {
    return this.client.get<CrossChainTransfer>(CROSS_CHAIN_ENDPOINTS.GET(id));
  }

  /**
   * Create a permanent route address
   */
  public async createPermanentRoute(data: Omit<PermanentRoute, 'id'>): Promise<PermanentRoute> {
    return this.client.post<PermanentRoute>(CROSS_CHAIN_ENDPOINTS.CREATE_ROUTE, data);
  }

  /**
   * List all permanent routes
   */
  public async listPermanentRoutes(): Promise<PermanentRoute[]> {
    return this.client.get<PermanentRoute[]>(CROSS_CHAIN_ENDPOINTS.ROUTES);
  }
}
