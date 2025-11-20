/**
 * API endpoints for Wallet management.
 */
export const WALLET_ENDPOINTS = {
  /** Endpoint to verify wallet ownership */
  VERIFY_OWNERSHIP: (customerId: string) => `/v0/customers/${customerId}/wallet-ownership`,
} as const;
