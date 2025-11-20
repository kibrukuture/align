import type { IbanDetails, UsDetails, ExternalAccountAddress } from '../external-accounts/external-accounts.types';

export type PaymentRail = 'ach' | 'wire' | 'sepa' | 'swift' | 'uaefts';
export type FiatCurrency = 'usd' | 'eur' | 'aed';
export type CryptoToken = 'usdc' | 'usdt' | 'eurc';
export type BlockchainNetwork = 'polygon' | 'ethereum' | 'solana' | 'base' | 'arbitrum' | 'tron';
export type TransferStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type TransferPurpose = 
  | 'charity' | 'commercial_investment' | 'corporate_card' | 'credit_card' | 'dividend' 
  | 'family' | 'financial_services' | 'good_sold' | 'goods_bought' | 'government' 
  | 'insurance' | 'intergroup_transfer' | 'intra_group_dividends' | 'information_technology' 
  | 'leasing' | 'loan_charges' | 'merchant_settlement' | 'mobile_wallet' | 'none' 
  | 'non_resident_transfer_between_accounts' | 'pension' | 'personal_expenses' 
  | 'prepaid_cards' | 'professional' | 'rental' | 'resident_transfer_between_accounts' 
  | 'salaries' | 'telecommunications' | 'travel' | 'utility_bill';

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
  source_token?: string;
  source_network?: string;
  destination_currency?: string;
  destination_payment_rails?: string;
  destination_amount: string;
  fee_amount: string;
  exchange_rate: string;
  // Onramp specific fields
  source_currency?: string;
  source_payment_rails?: string;
  destination_token?: string;
  destination_network?: string;
}

// Destination Bank Account Types for Transfer Creation
export interface IbanAccountDetails {
  bank_name: string;
  account_holder_type: 'individual' | 'business';
  account_holder_first_name?: string;
  account_holder_last_name?: string;
  account_holder_business_name?: string;
  account_holder_address: ExternalAccountAddress;
  account_type: 'iban';
  iban: IbanDetails;
}

export interface UsAccountDetails {
  bank_name: string;
  account_holder_type: 'individual' | 'business';
  account_holder_first_name?: string;
  account_holder_last_name?: string;
  account_holder_business_name?: string;
  account_holder_address: ExternalAccountAddress;
  account_type: 'us';
  us: UsDetails;
}

export type DestinationBankAccount = IbanAccountDetails | UsAccountDetails;

export interface CreateOfframpTransferRequest {
  transfer_purpose: TransferPurpose;
  destination_external_account_id?: string;
  destination_bank_account?: DestinationBankAccount;
}

export interface CreateOnrampTransferRequest {
  destination_address: string;
}

export type CreateTransferFromQuoteRequest = CreateOfframpTransferRequest | CreateOnrampTransferRequest;

export interface CompleteOfframpTransferRequest {
  deposit_transaction_hash: string;
}

export interface SimulateOfframpTransferRequest {
  action: 'complete_transfer';
  transfer_id: string;
}

export interface SimulateOnrampTransferRequest {
  action: 'complete_transfer';
  transfer_id: string;
}

export interface SimulateTransferResponse {
  message: string;
}

export interface Transfer {
  id: string;
  status: TransferStatus;
  amount: string;
  // Common fields
  source_currency?: string;
  destination_network?: string;
  destination_token?: string;
  fee_amount?: string;
  
  // Offramp specific
  source_token?: string;
  source_network?: string;
  destination_currency?: string;
  destination_payment_rails?: string;
  transfer_purpose?: string;
  destination_bank_account?: DestinationBankAccount;
  
  // Onramp specific
  source_rails?: string;
  destination_address?: string;
  
  created_at?: string;
  updated_at?: string;
  quote?: {
    // Common
    fee_amount?: string;
    exchange_rate?: string;
    
    // Offramp quote fields
    deposit_network?: string;
    deposit_token?: string;
    deposit_blockchain_address?: string;
    deposit_amount?: string;
    source_amount?: string;
    destination_amount?: string;
    deposit_transaction_hash?: string | null;
    
    // Onramp quote fields
    deposit_rails?: string;
    deposit_currency?: string;
    deposit_bank_account?: {
      bank_name?: string;
      bank_address?: string;
      account_beneficiary_type?: string;
      account_beneficiary_name?: string;
      account_type?: string;
      iban?: {
        bic: string;
        iban_number: string;
      };
      us?: {
        account_number: string;
        routing_number: string;
      };
    };
    deposit_message?: string;
  };
  [key: string]: unknown;
}

export interface TransferListResponse {
  items: Transfer[];
}
