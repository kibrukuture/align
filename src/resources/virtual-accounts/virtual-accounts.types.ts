export interface CreateVirtualAccountRequest {
  source_currency: 'usd' | 'eur';
  destination_token: 'usdc' | 'usdt';
  destination_network: 'polygon' | 'ethereum' | 'solana' | 'base';
  destination_address?: string;
}

export interface VirtualAccount {
  id: string;
  customer_id: string;
  address: string;
  network: string;
  currency: string;
  status: 'active' | 'inactive';
  created_at: string;
}
