import type { BlockchainNetwork, CryptoToken } from '@/resources/transfers/transfers.types';

export interface CreateCrossChainQuoteRequest {
  source_token: CryptoToken;
  source_network: BlockchainNetwork;
  destination_token: CryptoToken;
  destination_network: BlockchainNetwork;
  amount: string;
  is_source_amount: boolean;
}

export interface CrossChainQuote {
  quote_id: string;
  source_amount: string;
  destination_amount: string;
  exchange_rate: string;
  fee: string;
  expires_at: string;
}

export interface CreateCrossChainTransferRequest {
  quote_id: string;
  destination_address: string;
}

export interface PermanentRoute {
  id: string;
  source_token: CryptoToken;
  source_network: BlockchainNetwork;
  destination_token: CryptoToken;
  destination_network: BlockchainNetwork;
  deposit_address: string;
}

export interface CrossChainTransfer {
  id: string;
  quote_id: string;
  status: 'pending' | 'completed' | 'failed';
  source_amount: string;
  destination_amount: string;
  created_at: string;
  [key: string]: unknown;
}
