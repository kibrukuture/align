import type { BlockchainNetwork, CryptoToken } from '@/resources/transfers/transfers.types';

export interface CrossChainQuote {
  deposit_token: CryptoToken;
  deposit_address: string;
  deposit_network: BlockchainNetwork;
  deposit_amount: string;
  fee_amount: string;
}

export interface CreateCrossChainTransferRequest {
  amount: string;
  source_network: BlockchainNetwork;
  source_token: CryptoToken;
  destination_network: BlockchainNetwork;
  destination_token: CryptoToken;
  destination_address: string;
}

export interface CompleteCrossChainTransferRequest {
  deposit_transaction_hash: string;
}

export interface CrossChainTransfer {
  id: string;
  status: 'pending' | 'processing' | 'completed';
  amount: string;
  source_network: BlockchainNetwork;
  source_token: CryptoToken;
  source_address?: string | null;
  destination_network: BlockchainNetwork;
  destination_token: CryptoToken;
  destination_address: string;
  quote: CrossChainQuote;
  [key: string]: unknown;
}

export interface CreatePermanentRouteRequest {
  destination_network: BlockchainNetwork;
  destination_token: CryptoToken;
  destination_address: string;
}

export interface PermanentRouteAddress {
  permanent_route_address_id: string;
  route_chain_addresses: {
    ethereum?: { address: string };
    base?: { address: string };
    polygon?: { address: string };
    tron?: { address: string };
    solana?: { address: string };
    [key: string]: { address: string } | undefined;
  };
  route_destination: {
    network: string;
    token: CryptoToken;
    address: string;
  };
}

export interface PermanentRouteListResponse {
  items: PermanentRouteAddress[];
}
