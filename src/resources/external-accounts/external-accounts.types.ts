export interface Address {
  country: string;
  city: string;
  street_line_1: string;
  postal_code: string;
}

export interface IbanDetails {
  bic: string;
  iban_number: string;
}

export interface UsDetails {
  account_number: string;
  routing_number: string;
}

export interface CreateExternalAccountRequest {
  bank_name: string;
  account_holder_type: 'individual' | 'business';
  account_holder_first_name?: string;
  account_holder_last_name?: string;
  account_holder_business_name?: string;
  account_holder_address: Address;
  account_type: 'iban' | 'us';
  iban?: IbanDetails;
  us?: UsDetails;
}

export interface ExternalAccount {
  id: string;
  created_at: string;
  bank_name: string;
  account_holder_type: 'individual' | 'business';
  account_type: 'iban' | 'us';
  // ... other fields matching request
}
