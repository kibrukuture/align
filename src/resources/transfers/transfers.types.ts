export type PaymentRail = 'ach' | 'wire' | 'sepa' | 'swift' | 'uaefts';
export type FiatCurrency = 'usd' | 'eur' | 'aed';
export type CryptoToken = 'usdc' | 'usdt' | 'eurc';
export type BlockchainNetwork = 'polygon' | 'ethereum' | 'solana' | 'base' | 'arbitrum' | 'tron';

export interface CreateOfframpQuoteRequest {
  source_amount?: string;
  destination_amount?: string;
  source_token: CryptoToken;
  source_network: BlockchainNetwork;
  destination_currency: FiatCurrency;
  destination_payment_rails: PaymentRail;
  developer_fee_percent?: string;
}

export interface CreateOnrampQuoteRequest {
  source_amount?: string;
  destination_amount?: string;
  source_currency: FiatCurrency;
  source_payment_rails: PaymentRail;
  destination_token: CryptoToken;
  destination_network: BlockchainNetwork;
  developer_fee_percent?: string;
}

export interface QuoteResponse {
  quote_id: string;
  source_amount: string;
  source_currency?: string;
  source_token?: string;
  source_network?: string;
  source_payment_rails?: string;
  destination_amount: string;
  destination_currency?: string;
  destination_token?: string;
  destination_network?: string;
  destination_payment_rails?: string;
  fee_amount: string;
  exchange_rate: string;
}

export interface CreateTransferFromQuoteRequest {
  transfer_purpose: string;
  destination_external_account_id?: string;
  destination_bank_account_details?: Record<string, unknown>;
}

export interface Transfer {
  id: string;
  amount: string;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}
