import type { KycStatus, CustomerType } from '@/types/common';

/**
 * Customer address information (only available for approved KYC)
 */
export interface CustomerAddress {
  country: string;
  city: string;
  street_line_1: string;
  postal_code: string;
  state: string;
}

/**
 * KYC status breakdown by currency and payment rails
 */
export interface KycStatusBreakdown {
  currency: 'usd' | 'eur' | 'aed';
  payment_rails: 'ach' | 'wire' | 'sepa' | 'swift' | 'uaefts';
  status: KycStatus;
}

/**
 * KYC sub-status during verification process
 */
export type KycSubStatus = 
  | 'kyc_form_submission_started'
  | 'kyc_form_submission_accepted'
  | 'kyc_form_resubmission_required';

/**
 * Detailed KYC information
 */
export interface CustomerKycs {
  status_breakdown: KycStatusBreakdown[];
  sub_status: KycSubStatus;
  kyc_flow_link: string;
}

/**
 * Customer object returned by the API
 */
export interface Customer {
  customer_id: string;
  email: string;
  type: CustomerType;
  company_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  address?: CustomerAddress | null;
  kycs?: CustomerKycs | null;
}

/**
 * Document for customer update
 */
export interface CustomerDocument {
  file_id: string;
  purpose: 
    | 'id_document'
    | 'proof_of_address'
    | 'proof_of_source_of_funds'
    | 'business_formation'
    | 'directors_registry'
    | 'shareholder_registry'
    | 'proof_of_nature_of_business'
    | 'other';
  description?: string;
}

/**
 * Request body for creating a customer
 */
export interface CreateCustomerRequest {
  email: string;
  type: CustomerType;
  first_name?: string;
  last_name?: string;
  company_name?: string;
}

/**
 * Request body for updating a customer
 */
export interface UpdateCustomerRequest {
  documents: CustomerDocument[];
}

/**
 * Response from listing customers
 */
export interface CustomerListResponse {
  items: Customer[];
}

/**
 * KYC session response
 */
export interface KycSessionResponse {
  kycs: {
    kyc_flow_link: string;
  };
}
