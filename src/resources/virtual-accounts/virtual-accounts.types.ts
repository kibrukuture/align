/**
 * Source currency for virtual account deposits
 */
export type SourceCurrency = 'usd' | 'eur' | 'aed';

/**
 * Source rails for deposits (optional, only for USD SWIFT)
 */
export type SourceRails = 'swift';

/**
 * Destination token for converted funds
 */
export type DestinationToken = 'usdc' | 'usdt';

/**
 * Destination blockchain network
 */
export type DestinationNetwork = 'polygon' | 'ethereum' | 'solana' | 'base' | 'tron' | 'arbitrum';

/**
 * Virtual account status
 */
export type VirtualAccountStatus = 'active';

/**
 * Payment rails for deposits
 */
export type PaymentRails = 'sepa' | 'ach' | 'wire';

/**
 * Deposit currency
 */
export type DepositCurrency = 'eur' | 'usd';

/**
 * IBAN account details for EUR deposits
 */
export interface IBANAccountDetails {
  /** Available rails for deposits */
  payment_rails: ['sepa'];
  /** Currency used for the deposit */
  currency: 'eur';
  /** Bank name */
  bank_name: string;
  /** Bank address */
  bank_address: string;
  /** Account holder name */
  account_holder_name: string;
  /** IBAN details */
  iban: {
    /** BIC/SWIFT code */
    bic: string;
    /** IBAN number */
    iban_number: string;
  };
}

/**
 * US account details for USD deposits
 */
export interface USAccountDetails {
  /** Available rails for deposits */
  payment_rails: ('ach' | 'wire')[];
  /** Currency used for the deposit */
  currency: 'usd';
  /** Bank name */
  bank_name: string;
  /** Bank address */
  bank_address: string;
  /** Account beneficiary name */
  account_beneficiary_name: string;
  /** Account beneficiary address */
  account_beneficiary_address: string;
  /** US account details */
  us: {
    /** Account number */
    account_number: string;
    /** Routing number */
    routing_number: string;
  };
}

/**
 * Deposit instructions (either IBAN or US account)
 */
export type DepositInstructions = IBANAccountDetails | USAccountDetails;

/**
 * Request to create a virtual account
 */
export interface CreateVirtualAccountRequest {
  /** The currency for the source */
  source_currency: SourceCurrency;
  /** Required only for USD in case you want to accept SWIFT payments */
  source_rails?: SourceRails;
  /** The currency to be deposited */
  destination_token: DestinationToken;
  /** The blockchain network for the destination */
  destination_network: DestinationNetwork;
  /** The blockchain address where the funds will be sent */
  destination_address: string;
}

/**
 * Virtual account response
 */
export interface VirtualAccount {
  /** The unique identifier for the virtual account */
  id: string;
  /** The current status of the virtual account */
  status: VirtualAccountStatus;
  /** The currency to be deposited */
  destination_token: DestinationToken | 'aed';
  /** The blockchain network for the destination */
  destination_network: DestinationNetwork;
  /** The blockchain address where the funds will be sent */
  destination_address: string;
  /** Deposit instructions with bank account details */
  deposit_instructions: DepositInstructions;
}

/**
 * List response for virtual accounts
 */
export interface VirtualAccountListResponse {
  /** Array of virtual accounts */
  items: VirtualAccount[];
}
