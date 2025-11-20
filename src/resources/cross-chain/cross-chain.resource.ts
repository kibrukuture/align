import { HttpClient } from '@/core/http-client';
import { AlignValidationError } from '@/core/errors';
import { formatZodError } from '@/core/validation';
import type { 
  CreateCrossChainTransferRequest, 
  CrossChainTransfer,
  CompleteCrossChainTransferRequest,
  CreatePermanentRouteRequest,
  PermanentRouteAddress,
  PermanentRouteListResponse
} from '@/resources/cross-chain/cross-chain.types';
import { 
  CreateCrossChainTransferSchema, 
  CompleteCrossChainTransferSchema,
  CreatePermanentRouteSchema
} from '@/resources/cross-chain/cross-chain.validator';
import { CROSS_CHAIN_ENDPOINTS } from '@/constants';

export class CrossChainResource {
  constructor(private client: HttpClient) {}

  /**
   * Create a cross-chain transfer
   * 
   * Initiate a transfer of cryptocurrency across different blockchain networks.
   * 
   * @param customerId - The unique customer identifier (UUID)
   * @param data - Transfer parameters
   * @param data.amount - Amount to transfer
   * @param data.source_network - Source blockchain network
   * @param data.source_token - Source cryptocurrency token
   * @param data.destination_network - Destination blockchain network
   * @param data.destination_token - Destination cryptocurrency token
   * @param data.destination_address - Destination wallet address
   * @returns Promise resolving to the created transfer object
   * @throws {AlignValidationError} If the transfer data is invalid
   * 
   * @example
   * ```typescript
   * const transfer = await align.crossChain.createTransfer('123e4567-e89b-12d3-a456-426614174000', {
   *   amount: '100.00',
   *   source_network: 'ethereum',
   *   source_token: 'usdc',
   *   destination_network: 'polygon',
   *   destination_token: 'usdc',
   *   destination_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
   * });
   * console.log(transfer.id);
   * console.log(transfer.quote.fee_amount);
   * ```
   */
  public async createTransfer(customerId: string, data: CreateCrossChainTransferRequest): Promise<CrossChainTransfer> {
    const validation = CreateCrossChainTransferSchema.safeParse(data);
    if (!validation.success) {
      throw new AlignValidationError('Invalid cross-chain transfer data', formatZodError(validation.error));
    }

    return this.client.post<CrossChainTransfer>(CROSS_CHAIN_ENDPOINTS.CREATE(customerId), data);
  }

  /**
   * Complete a cross-chain transfer
   * 
   * Finalize the transfer by providing the deposit transaction hash.
   * 
   * @param customerId - The unique customer identifier (UUID)
   * @param transferId - The unique transfer identifier (UUID)
   * @param data - Completion data
   * @param data.deposit_transaction_hash - The transaction hash of the deposit
   * @returns Promise resolving to the updated transfer object
   * @throws {AlignValidationError} If the completion data is invalid
   * 
   * @example
   * ```typescript
   * const transfer = await align.crossChain.completeTransfer(
   *   '123e4567-e89b-12d3-a456-426614174000',
   *   'transfer_abc123',
   *   {
   *     deposit_transaction_hash: '0x123...',
   *   }
   * );
   * console.log(transfer.status); // "processing"
   * ```
   */
  public async completeTransfer(customerId: string, transferId: string, data: CompleteCrossChainTransferRequest): Promise<CrossChainTransfer> {
    const validation = CompleteCrossChainTransferSchema.safeParse(data);
    if (!validation.success) {
      throw new AlignValidationError('Invalid completion data', formatZodError(validation.error));
    }

    return this.client.post<CrossChainTransfer>(CROSS_CHAIN_ENDPOINTS.COMPLETE(customerId, transferId), data);
  }

  /**
   * Retrieve a cross-chain transfer by its unique identifier
   * 
   * @param customerId - The unique customer identifier (UUID)
   * @param transferId - The unique transfer identifier (UUID)
   * @returns Promise resolving to the cross-chain transfer object
   * 
   * @example
   * ```typescript
   * const transfer = await align.crossChain.getTransfer(
   *   '123e4567-e89b-12d3-a456-426614174000',
   *   'transfer_abc123'
   * );
   * console.log(transfer.status);
   * ```
   */
  public async getTransfer(customerId: string, transferId: string): Promise<CrossChainTransfer> {
    return this.client.get<CrossChainTransfer>(CROSS_CHAIN_ENDPOINTS.GET(customerId, transferId));
  }

  /**
   * Create a permanent route address
   * 
   * Generate a personalized address for Cross-Chain Transfers.
   * 
   * @param customerId - The unique customer identifier (UUID)
   * @param data - Permanent route configuration
   * @param data.destination_network - Destination blockchain network
   * @param data.destination_token - Destination cryptocurrency token
   * @param data.destination_address - Destination wallet address
   * @returns Promise resolving to the created permanent route address
   * @throws {AlignValidationError} If the route data is invalid
   * 
   * @example
   * ```typescript
   * const route = await align.crossChain.createPermanentRouteAddress('123e4567-e89b-12d3-a456-426614174000', {
   *   destination_network: 'polygon',
   *   destination_token: 'usdc',
   *   destination_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
   * });
   * console.log(route.permanent_route_address_id);
   * ```
   */
  public async createPermanentRouteAddress(customerId: string, data: CreatePermanentRouteRequest): Promise<PermanentRouteAddress> {
    const validation = CreatePermanentRouteSchema.safeParse(data);
    if (!validation.success) {
      throw new AlignValidationError('Invalid permanent route data', formatZodError(validation.error));
    }

    return this.client.post<PermanentRouteAddress>(CROSS_CHAIN_ENDPOINTS.CREATE_ROUTE(customerId), data);
  }

  /**
   * Get a permanent route address by ID
   * 
   * @param customerId - The unique customer identifier (UUID)
   * @param addressId - The unique permanent route address identifier (UUID)
   * @returns Promise resolving to the permanent route address
   * 
   * @example
   * ```typescript
   * const route = await align.crossChain.getPermanentRouteAddress(
   *   '123e4567-e89b-12d3-a456-426614174000',
   *   'route_abc123'
   * );
   * console.log(route.route_chain_addresses.ethereum?.address);
   * ```
   */
  public async getPermanentRouteAddress(customerId: string, addressId: string): Promise<PermanentRouteAddress> {
    return this.client.get<PermanentRouteAddress>(CROSS_CHAIN_ENDPOINTS.GET_ROUTE(customerId, addressId));
  }

  /**
   * List all permanent route addresses for a customer
   * 
   * @param customerId - The unique customer identifier (UUID)
   * @returns Promise resolving to a list of permanent route addresses
   * 
   * @example
   * ```typescript
   * const routes = await align.crossChain.listPermanentRouteAddresses('123e4567-e89b-12d3-a456-426614174000');
   * routes.items.forEach(route => {
   *   console.log(route.permanent_route_address_id);
   * });
   * ```
   */
  public async listPermanentRouteAddresses(customerId: string): Promise<PermanentRouteListResponse> {
    return this.client.get<PermanentRouteListResponse>(CROSS_CHAIN_ENDPOINTS.LIST_ROUTES(customerId));
  }
}
