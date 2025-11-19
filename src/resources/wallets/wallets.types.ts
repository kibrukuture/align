export interface VerifyWalletRequest {
  wallet_address: string;
}

export interface WalletVerification {
  verification_link: string;
  status: 'pending' | 'verified';
}
