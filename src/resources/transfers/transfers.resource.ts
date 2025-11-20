import { HttpClient } from '@/core/http-client';
import { AlignValidationError } from '@/core/errors';
import type { 
  CreateOfframpQuoteRequest, 
  CreateOnrampQuoteRequest, 
  QuoteResponse,
  CreateTransferFromQuoteRequest,
  Transfer
} from '@/resources/transfers/transfers.types';
import { CreateOfframpQuoteSchema, CreateOnrampQuoteSchema } from '@/resources/transfers/transfers.validator';
import { TRANSFER_ENDPOINTS } from '@/constants';

export class TransfersResource {
  constructor(private client: HttpClient) {}

  /**
   * Create an offramp quote (crypto to fiat)
   * 
   * Get a quote for converting cryptocurrency to fiat currency. You can specify either
   * the source amount (crypto) or destination amount (fiat) you want.
   * 
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
   * const quote = await align.transfers.createOfframpQuote({
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
  public async createOfframpQuote(data: CreateOfframpQuoteRequest): Promise<QuoteResponse> {
    const validation = CreateOfframpQuoteSchema.safeParse(data);
    if (!validation.success) {
      throw new AlignValidationError('Invalid offramp quote data', validation.error.flatten().fieldErrors as Record<string, string[]>);
    }

    return this.client.post<QuoteResponse>(TRANSFER_ENDPOINTS.OFFRAMP_QUOTE, data);
  }

  /**
   * Create an onramp quote (fiat to crypto)
   * 
   * Get a quote for converting fiat currency to cryptocurrency. You can specify either
   * the source amount (fiat) or destination amount (crypto) you want.
   * 
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
   * const quote = await align.transfers.createOnrampQuote({
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
  public async createOnrampQuote(data: CreateOnrampQuoteRequest): Promise<QuoteResponse> {
    const validation = CreateOnrampQuoteSchema.safeParse(data);
    if (!validation.success) {
      throw new AlignValidationError('Invalid onramp quote data', validation.error.flatten().fieldErrors as Record<string, string[]>);
    }

    return this.client.post<QuoteResponse>(TRANSFER_ENDPOINTS.ONRAMP_QUOTE, data);
  }

  /**
   * Execute an offramp transfer from a quote
   * 
   * After creating a quote, use this method to execute the actual transfer.
   * 
   * @param data - Transfer execution parameters
   * @param data.transfer_purpose - Description of the transfer purpose
   * @param data.destination_external_account_id - ID of the external bank account to send to (optional)
   * @param data.destination_bank_account_details - Bank account details if not using external account (optional)
   * @returns Promise resolving to the created transfer object
   * 
   * @example
   * ```typescript
   * const transfer = await align.transfers.createOfframpTransfer({
   *   transfer_purpose: 'Payment for services',
   *   destination_external_account_id: 'ext_acc_123',
   * });
   * console.log(transfer.id); // "transfer_abc123"
   * console.log(transfer.status); // "pending"
   * ```
   */
  public async createOfframpTransfer(data: CreateTransferFromQuoteRequest): Promise<Transfer> {
    return this.client.post<Transfer>(TRANSFER_ENDPOINTS.OFFRAMP_CREATE, data);
  }

  /**
   * Execute an onramp transfer from a quote
   * 
   * After creating a quote, use this method to execute the actual transfer.
   * 
   * @param data - Transfer execution parameters
   * @param data.transfer_purpose - Description of the transfer purpose
   * @returns Promise resolving to the created transfer object
   * 
   * @example
   * ```typescript
   * const transfer = await align.transfers.createOnrampTransfer({
   *   transfer_purpose: 'Crypto purchase',
   * });
   * console.log(transfer.id); // "transfer_xyz789"
   * ```
   */
  public async createOnrampTransfer(data: CreateTransferFromQuoteRequest): Promise<Transfer> {
    return this.client.post<Transfer>(TRANSFER_ENDPOINTS.ONRAMP_CREATE, data);
  }

  /**
   * Retrieve an offramp transfer by its unique identifier
   * 
   * @param id - The unique transfer identifier
   * @returns Promise resolving to the transfer object
   * 
   * @example
   * ```typescript
   * const transfer = await align.transfers.getOfframpTransfer('transfer_abc123');
   * console.log(transfer.status); // "completed"
   * console.log(transfer.amount); // "95.00"
   * ```
   */
  public async getOfframpTransfer(id: string): Promise<Transfer> {
    return this.client.get<Transfer>(TRANSFER_ENDPOINTS.OFFRAMP_GET(id));
  }

  /**
   * Retrieve an onramp transfer by its unique identifier
   * 
   * @param id - The unique transfer identifier
   * @returns Promise resolving to the transfer object
   * 
   * @example
   * ```typescript
   * const transfer = await align.transfers.getOnrampTransfer('transfer_xyz789');
   * console.log(transfer.status); // "completed"
   * ```
   */
  public async getOnrampTransfer(id: string): Promise<Transfer> {
    return this.client.get<Transfer>(TRANSFER_ENDPOINTS.ONRAMP_GET(id));
  }

  /**
   * List all offramp transfers
   * 
   * @returns Promise resolving to an array of offramp transfers
   * 
   * @example
   * ```typescript
   * const transfers = await align.transfers.listOfframpTransfers();
   * transfers.forEach(transfer => {
   *   console.log(`${transfer.id}: ${transfer.status} - $${transfer.amount}`);
   * });
   * ```
   */
  public async listOfframpTransfers(): Promise<Transfer[]> {
    return this.client.get<Transfer[]>(TRANSFER_ENDPOINTS.OFFRAMP_LIST);
  }

  /**
   * List all onramp transfers
   * 
   * @returns Promise resolving to an array of onramp transfers
   * 
   * @example
   * ```typescript
   * const transfers = await align.transfers.listOnrampTransfers();
   * transfers.forEach(transfer => {
   *   console.log(`${transfer.id}: ${transfer.status}`);
   * });
   * ```
   */
  public async listOnrampTransfers(): Promise<Transfer[]> {
    return this.client.get<Transfer[]>(TRANSFER_ENDPOINTS.ONRAMP_LIST);
  }

  /**
   * Simulate a transfer status change (Sandbox environment only)
   * 
   * This method is only available in the sandbox environment and allows you to
   * simulate transfer completion or failure for testing purposes.
   * 
   * @param transferId - The unique transfer identifier
   * @param status - The status to simulate: 'completed' or 'failed'
   * @returns Promise resolving to the updated transfer object
   * 
   * @example
   * ```typescript
   * // Simulate transfer completion
   * const completedTransfer = await align.transfers.simulate(
   *   'transfer_abc123',
   *   'completed'
   * );
   * console.log(completedTransfer.status); // "completed"
   * 
   * // Simulate transfer failure
   * const failedTransfer = await align.transfers.simulate(
   *   'transfer_xyz789',
   *   'failed'
   * );
   * console.log(failedTransfer.status); // "failed"
   * ```
   */
  public async simulate(transferId: string, status: 'completed' | 'failed'): Promise<Transfer> {
    return this.client.post<Transfer>(TRANSFER_ENDPOINTS.SIMULATE(transferId), { status });
  }
}
