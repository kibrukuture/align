/**
 * API endpoints for Wallet management.
 */
export const WALLET_ENDPOINTS = {
  /** Endpoint to verify wallet ownership */
  VERIFY: '/wallets/verify',
  VERIFY_OWNERSHIP: (customerId: string) => `/customers/${customerId}/wallet-ownership`,
} as const;
