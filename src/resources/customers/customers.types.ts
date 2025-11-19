export interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  type: 'individual' | 'business';
  created_at: string;
  updated_at: string;
  kyc_status?: 'pending' | 'approved' | 'rejected' | 'not_started';
}

export interface CreateCustomerRequest {
  email: string;
  first_name: string;
  last_name: string;
  type: 'individual' | 'business';
}

export interface UpdateCustomerRequest {
  email?: string;
  first_name?: string;
  last_name?: string;
}

export interface CustomerListResponse {
  data: Customer[];
  has_more: boolean;
  total_count: number;
}

export interface KycSessionResponse {
  session_id: string;
  url: string;
  status: string;
}
