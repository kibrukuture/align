import { HttpClient } from '@/core/http-client';
import { AlignValidationError } from '@/core/errors';
import type { 
  CreateOfframpQuoteRequest, 
  CreateOnrampQuoteRequest, 
  QuoteResponse,
  CreateOfframpTransferRequest,
  CreateOnrampTransferRequest,
  Transfer,
  CompleteOfframpTransferRequest,
  SimulateOfframpTransferRequest,
  SimulateOnrampTransferRequest,
  SimulateTransferResponse,
  TransferListResponse
} from '@/resources/transfers/transfers.types';
import { 
  CreateOfframpQuoteSchema, 
  CreateOnrampQuoteSchema, 
  CreateOfframpTransferSchema,
  CreateOnrampTransferSchema,
  CompleteOfframpTransferSchema,
  SimulateOfframpTransferSchema,
  SimulateOnrampTransferSchema
} from '@/resources/transfers/transfers.validator';
import { TRANSFER_ENDPOINTS } from '@/constants';

export class TransfersResource {
  constructor(private client: HttpClient) {}

  /**
   * Create an offramp quote (crypto to fiat)
   * 
   * Get a quote for converting cryptocurrency to fiat currency. You can specify either
   * the source amount (crypto) or destination amount (fiat) you want.
   * 
   * @param customerId - The unique customer identifier (UUID)
   * @param data - Offramp quote parameters
   * @param data.source_amount - Amount of crypto to send (optional, specify this OR destination_amount)
   * @param data.destination_amount - Amount of fiat to receive (optional, specify this OR source_amount)
   * @param data.source_token - Cryptocurrency token: 'usdc', 'usdt', or 'eurc'
   * @param data.source_network - Blockchain network: 'polygon', 'ethereum', 'solana', 'base', 'arbitrum', or 'tron'
   * @param data.destination_currency - Fiat currency: 'usd', 'eur', or 'aed'
   * @param data.destination_payment_rails - Payment method: 'ach', 'wire', 'sepa', 'swift', or 'uaefts'
   * @param data.developer_fee_percent - Optional developer fee percentage (e.g., "0.5" for 0.5%)
   * @returns Promise resolving to the quote with exchange rate and fee information
   * @throws {AlignValidationError} If the quote data is invalid
   * 
   * @example
   * ```typescript
   * // Quote with source amount (you know how much crypto to send)
   * const quote = await align.transfers.createOfframpQuote('123e4567-e89b-12d3-a456-426614174000', {
   *   source_amount: '100.00',
   *   source_token: 'usdc',
   *   source_network: 'polygon',
   *   destination_currency: 'usd',
   *   destination_payment_rails: 'ach',
   * });
   * console.log(`Send ${quote.source_amount} USDC`);
   * console.log(`Receive ${quote.destination_amount} USD`);
   * console.log(`Fee: ${quote.fee_amount}`);
   * ```
   */
  public async createOfframpQuote(customerId: string, data: CreateOfframpQuoteRequest): Promise<QuoteResponse> {
    const validation = CreateOfframpQuoteSchema.safeParse(data);
    if (!validation.success) {
      throw new AlignValidationError('Invalid offramp quote data', validation.error.flatten().fieldErrors as Record<string, string[]>);
    }

    return this.client.post<QuoteResponse>(TRANSFER_ENDPOINTS.OFFRAMP_QUOTE(customerId), data);
  }

  /**
   * Create an onramp quote (fiat to crypto)
   * 
   * Get a quote for converting fiat currency to cryptocurrency. You can specify either
   * the source amount (fiat) or destination amount (crypto) you want.
   * 
   * @param customerId - The unique customer identifier (UUID)
   * @param data - Onramp quote parameters
   * @param data.source_amount - Amount of fiat to send (optional, specify this OR destination_amount)
   * @param data.destination_amount - Amount of crypto to receive (optional, specify this OR source_amount)
   * @param data.source_currency - Fiat currency: 'usd', 'eur', or 'aed'
   * @param data.source_payment_rails - Payment method: 'ach', 'wire', 'sepa', 'swift', or 'uaefts'
   * @param data.destination_token - Cryptocurrency token: 'usdc', 'usdt', or 'eurc'
   * @param data.destination_network - Blockchain network: 'polygon', 'ethereum', 'solana', 'base', 'arbitrum', or 'tron'
   * @param data.developer_fee_percent - Optional developer fee percentage (e.g., "0.5" for 0.5%)
   * @returns Promise resolving to the quote with exchange rate and fee information
   * @throws {AlignValidationError} If the quote data is invalid
   * 
   * @example
   * ```typescript
   * const quote = await align.transfers.createOnrampQuote('123e4567-e89b-12d3-a456-426614174000', {
   *   source_amount: '100.00',
   *   source_currency: 'usd',
   *   source_payment_rails: 'ach',
   *   destination_token: 'usdc',
   *   destination_network: 'polygon',
   * });
   * console.log(`Send $${quote.source_amount} USD`);
   * console.log(`Receive ${quote.destination_amount} USDC`);
   * ```
   */
  public async createOnrampQuote(customerId: string, data: CreateOnrampQuoteRequest): Promise<QuoteResponse> {
    const validation = CreateOnrampQuoteSchema.safeParse(data);
    if (!validation.success) {
      throw new AlignValidationError('Invalid onramp quote data', validation.error.flatten().fieldErrors as Record<string, string[]>);
    }

    return this.client.post<QuoteResponse>(TRANSFER_ENDPOINTS.ONRAMP_QUOTE(customerId), data);
  }

  /**
   * Create an offramp transfer from a quote
   * 
   * After creating a quote, use this method to initiate the transfer.
   * 
   * @param customerId - The unique customer identifier (UUID)
   * @param quoteId - The unique quote identifier (UUID)
   * @param data - Transfer execution parameters
   * @param data.transfer_purpose - Description of the transfer purpose
   * @param data.destination_external_account_id - ID of the external bank account to send to (optional)
   * @param data.destination_bank_account - Bank account details if not using external account (optional)
   * @returns Promise resolving to the created transfer object
   * @throws {AlignValidationError} If the transfer data is invalid
   * 
   * @example
   * ```typescript
   * const transfer = await align.transfers.createOfframpTransfer(
   *   '123e4567-e89b-12d3-a456-426614174000',
   *   'quote_123',
   *   {
   *     transfer_purpose: 'commercial_investment',
   *     destination_external_account_id: 'ext_acc_123',
   *   }
   * );
   * console.log(transfer.id); // "transfer_abc123"
   * console.log(transfer.status); // "processing"
   * ```
   */
  public async createOfframpTransfer(customerId: string, quoteId: string, data: CreateOfframpTransferRequest): Promise<Transfer> {
    const validation = CreateOfframpTransferSchema.safeParse(data);
    if (!validation.success) {
      throw new AlignValidationError('Invalid transfer data', validation.error.flatten().fieldErrors as Record<string, string[]>);
    }

    return this.client.post<Transfer>(TRANSFER_ENDPOINTS.OFFRAMP_CREATE(customerId, quoteId), data);
  }

  /**
   * Complete an offramp transfer
   * 
   * Finalize the offramp transfer by providing the deposit transaction hash.
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
   * const transfer = await align.transfers.completeOfframpTransfer(
   *   '123e4567-e89b-12d3-a456-426614174000',
   *   'transfer_abc123',
   *   {
   *     deposit_transaction_hash: '0x123...',
   *   }
   * );
   * console.log(transfer.status); // "processing"
   * ```
   */
  public async completeOfframpTransfer(customerId: string, transferId: string, data: CompleteOfframpTransferRequest): Promise<Transfer> {
    const validation = CompleteOfframpTransferSchema.safeParse(data);
    if (!validation.success) {
      throw new AlignValidationError('Invalid completion data', validation.error.flatten().fieldErrors as Record<string, string[]>);
    }

    return this.client.post<Transfer>(TRANSFER_ENDPOINTS.OFFRAMP_COMPLETE(customerId, transferId), data);
  }

  /**
   * Create an onramp transfer from a quote
   * 
   * After creating a quote, use this method to execute the actual transfer.
   * 
   * @param customerId - The unique customer identifier (UUID)
   * @param quoteId - The unique quote identifier (UUID)
   * @param data - Transfer execution parameters
   * @param data.destination_address - The blockchain address where funds will be sent
   * @returns Promise resolving to the created transfer object
   * @throws {AlignValidationError} If the transfer data is invalid
   * 
   * @example
   * ```typescript
   * const transfer = await align.transfers.createOnrampTransfer(
   *   '123e4567-e89b-12d3-a456-426614174000',
   *   'quote_123',
   *   {
   *     destination_address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
   *   }
   * );
   * console.log(transfer.id); // "transfer_xyz789"
   * ```
   */
  public async createOnrampTransfer(customerId: string, quoteId: string, data: CreateOnrampTransferRequest): Promise<Transfer> {
    const validation = CreateOnrampTransferSchema.safeParse(data);
    if (!validation.success) {
      throw new AlignValidationError('Invalid onramp transfer data', validation.error.flatten().fieldErrors as Record<string, string[]>);
    }

    return this.client.post<Transfer>(TRANSFER_ENDPOINTS.ONRAMP_CREATE(customerId, quoteId), data);
  }

  /**
   * Retrieve an offramp transfer by its unique identifier
   * 
   * @param customerId - The unique customer identifier (UUID)
   * @param transferId - The unique transfer identifier (UUID)
   * @returns Promise resolving to the transfer object
   * 
   * @example
   * ```typescript
   * const transfer = await align.transfers.getOfframpTransfer(
   *   '123e4567-e89b-12d3-a456-426614174000',
   *   'transfer_abc123'
   * );
   * console.log(transfer.status); // "completed"
   * console.log(transfer.amount); // "95.00"
   * ```
   */
  public async getOfframpTransfer(customerId: string, transferId: string): Promise<Transfer> {
    return this.client.get<Transfer>(TRANSFER_ENDPOINTS.OFFRAMP_GET(customerId, transferId));
  }

  /**
   * Retrieve an onramp transfer by its unique identifier
   * 
   * @param customerId - The unique customer identifier (UUID)
   * @param transferId - The unique transfer identifier (UUID)
   * @returns Promise resolving to the transfer object
   * 
   * @example
   * ```typescript
   * const transfer = await align.transfers.getOnrampTransfer(
   *   '123e4567-e89b-12d3-a456-426614174000',
   *   'transfer_xyz789'
   * );
   * console.log(transfer.status); // "completed"
   * ```
   */
  public async getOnrampTransfer(customerId: string, transferId: string): Promise<Transfer> {
    return this.client.get<Transfer>(TRANSFER_ENDPOINTS.ONRAMP_GET(customerId, transferId));
  }

  /**
   * List all offramp transfers for a customer
   * 
   * @param customerId - The unique customer identifier (UUID)
   * @returns Promise resolving to a list of offramp transfers
   * 
   * @example
   * ```typescript
   * const transfers = await align.transfers.listOfframpTransfers('123e4567-e89b-12d3-a456-426614174000');
   * transfers.items.forEach(transfer => {
   *   console.log(`${transfer.id}: ${transfer.status} - $${transfer.amount}`);
   * });
   * ```
   */
  public async listOfframpTransfers(customerId: string): Promise<TransferListResponse> {
    return this.client.get<TransferListResponse>(TRANSFER_ENDPOINTS.OFFRAMP_LIST(customerId));
  }

  /**
   * List all onramp transfers for a customer
   * 
   * @param customerId - The unique customer identifier (UUID)
   * @returns Promise resolving to a list of onramp transfers
   * 
   * @example
   * ```typescript
   * const transfers = await align.transfers.listOnrampTransfers('123e4567-e89b-12d3-a456-426614174000');
   * transfers.items.forEach(transfer => {
   *   console.log(`${transfer.id}: ${transfer.status}`);
   * });
   * ```
   */
  public async listOnrampTransfers(customerId: string): Promise<TransferListResponse> {
    return this.client.get<TransferListResponse>(TRANSFER_ENDPOINTS.ONRAMP_LIST(customerId));
  }

  /**
   * Simulate an offramp transfer action (Sandbox environment only)
   * 
   * This method is only available in the sandbox environment and allows you to
   * simulate transfer actions like completion.
   * 
   * @param customerId - The unique customer identifier (UUID)
   * @param data - Simulation parameters
   * @param data.action - The action to simulate (e.g., 'complete_transfer')
   * @param data.transfer_id - The ID of the transfer to simulate action on
   * @returns Promise resolving to a message describing the result
   * 
   * @example
   * ```typescript
   * // Simulate transfer completion
   * const result = await align.transfers.simulateOfframpTransfer('123e4567-e89b-12d3-a456-426614174000', {
   *   action: 'complete_transfer',
   *   transfer_id: 'transfer_abc123'
   * });
   * console.log(result.message);
   * ```
   */
  public async simulateOfframpTransfer(customerId: string, data: SimulateOfframpTransferRequest): Promise<SimulateTransferResponse> {
    const validation = SimulateOfframpTransferSchema.safeParse(data);
    if (!validation.success) {
      throw new AlignValidationError('Invalid simulation data', validation.error.flatten().fieldErrors as Record<string, string[]>);
    }

    return this.client.post<SimulateTransferResponse>(TRANSFER_ENDPOINTS.SIMULATE(customerId), data);
  }

  /**
   * Simulate an onramp transfer action (Sandbox environment only)
   * 
   * This method is only available in the sandbox environment and allows you to
   * simulate transfer actions like completion.
   * 
   * @param customerId - The unique customer identifier (UUID)
   * @param data - Simulation parameters
   * @param data.action - The action to simulate (e.g., 'complete_transfer')
   * @param data.transfer_id - The ID of the transfer to simulate action on
   * @returns Promise resolving to a message describing the result
   * 
   * @example
   * ```typescript
   * // Simulate transfer completion
   * const result = await align.transfers.simulateOnrampTransfer('123e4567-e89b-12d3-a456-426614174000', {
   *   action: 'complete_transfer',
   *   transfer_id: 'transfer_xyz789'
   * });
   * console.log(result.message);
   * ```
   */
  public async simulateOnrampTransfer(customerId: string, data: SimulateOnrampTransferRequest): Promise<SimulateTransferResponse> {
    const validation = SimulateOnrampTransferSchema.safeParse(data);
    if (!validation.success) {
      throw new AlignValidationError('Invalid simulation data', validation.error.flatten().fieldErrors as Record<string, string[]>);
    }

    return this.client.post<SimulateTransferResponse>(TRANSFER_ENDPOINTS.ONRAMP_SIMULATE(customerId), data);
  }
}
