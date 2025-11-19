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
   * Create an Offramp Quote
   */
  public async createOfframpQuote(data: CreateOfframpQuoteRequest): Promise<QuoteResponse> {
    const validation = CreateOfframpQuoteSchema.safeParse(data);
    if (!validation.success) {
      throw new AlignValidationError('Invalid offramp quote data', validation.error.flatten().fieldErrors as Record<string, string[]>);
    }

    return this.client.post<QuoteResponse>(TRANSFER_ENDPOINTS.OFFRAMP_QUOTE, data);
  }

  /**
   * Create an onramp quote
   */
  public async createOnrampQuote(data: CreateOnrampQuoteRequest): Promise<QuoteResponse> {
    const validation = CreateOnrampQuoteSchema.safeParse(data);
    if (!validation.success) {
      throw new AlignValidationError('Invalid onramp quote data', validation.error.flatten().fieldErrors as Record<string, string[]>);
    }

    return this.client.post<QuoteResponse>(TRANSFER_ENDPOINTS.ONRAMP_QUOTE, data);
  }

  /**
   * Create an offramp transfer from a quote
   */
  public async createOfframpTransfer(data: CreateTransferFromQuoteRequest): Promise<Transfer> {
    return this.client.post<Transfer>(TRANSFER_ENDPOINTS.OFFRAMP_CREATE, data);
  }

  /**
   * Create an onramp transfer from a quote
   */
  public async createOnrampTransfer(data: CreateTransferFromQuoteRequest): Promise<Transfer> {
    return this.client.post<Transfer>(TRANSFER_ENDPOINTS.ONRAMP_CREATE, data);
  }

  /**
   * Get an offramp transfer by ID
   */
  public async getOfframpTransfer(id: string): Promise<Transfer> {
    return this.client.get<Transfer>(TRANSFER_ENDPOINTS.OFFRAMP_GET(id));
  }

  /**
   * Get an onramp transfer by ID
   */
  public async getOnrampTransfer(id: string): Promise<Transfer> {
    return this.client.get<Transfer>(TRANSFER_ENDPOINTS.ONRAMP_GET(id));
  }

  /**
   * List offramp transfers
   */
  public async listOfframpTransfers(): Promise<Transfer[]> {
    return this.client.get<Transfer[]>(TRANSFER_ENDPOINTS.OFFRAMP_LIST);
  }

  /**
   * List onramp transfers
   */
  public async listOnrampTransfers(): Promise<Transfer[]> {
    return this.client.get<Transfer[]>(TRANSFER_ENDPOINTS.ONRAMP_LIST);
  }

  /**
   * Simulate Transfer (Sandbox only)
   */
  public async simulate(transferId: string, status: 'completed' | 'failed'): Promise<Transfer> {
    return this.client.post<Transfer>(TRANSFER_ENDPOINTS.SIMULATE(transferId), { status });
  }
}
