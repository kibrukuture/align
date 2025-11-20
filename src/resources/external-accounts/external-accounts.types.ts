/**
 * Address for external account holder
 */
export interface ExternalAccountAddress {
  country: string;
  city: string;
  street_line_1: string;
  postal_code: string;
}

/**
 * IBAN details for international accounts
 */
export interface IbanDetails {
  bic: string;
  iban_number: string;
}

/**
 * US account details
 */
export interface UsDetails {
  account_number: string;
  routing_number: string;
}

/**
 * Base external account fields
 */
interface ExternalAccountBase {
  bank_name: string;
  account_holder_type: 'individual' | 'business';
  account_holder_first_name?: string;
  account_holder_last_name?: string;
  account_holder_business_name?: string;
  account_holder_address: ExternalAccountAddress;
}

/**
 * IBAN account request
 */
export interface IbanAccountRequest extends ExternalAccountBase {
  account_type: 'iban';
  iban: IbanDetails;
}

/**
 * US account request
 */
export interface UsAccountRequest extends ExternalAccountBase {
  account_type: 'us';
  us: UsDetails;
}

/**
 * Request to create external account (union of IBAN and US)
 */
export type CreateExternalAccountRequest = IbanAccountRequest | UsAccountRequest;

/**
 * IBAN account response
 */
export interface IbanAccountResponse extends ExternalAccountBase {
  id: string;
  created_at: string;
  account_type: 'iban';
  iban: IbanDetails;
}

/**
 * US account response
 */
export interface UsAccountResponse extends ExternalAccountBase {
  id: string;
  created_at: string;
  account_type: 'us';
  us: UsDetails;
}

/**
 * External account response (union of IBAN and US)
 */
export type ExternalAccount = IbanAccountResponse | UsAccountResponse;

/**
 * Response from listing external accounts
 */
export interface ExternalAccountListResponse {
  items: ExternalAccount[];
}
