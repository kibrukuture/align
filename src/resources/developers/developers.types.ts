export interface DeveloperFee {
  id: string;
  percent: string;
  wallet_address: string;
}

export interface UpdateDeveloperFeeRequest {
  percent: string;
  wallet_address: string;
}
