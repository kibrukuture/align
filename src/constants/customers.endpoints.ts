/**
 * API endpoints for Customer management.
 */
export const CUSTOMER_ENDPOINTS = {
  /** Endpoint to create a new customer */
  CREATE: '/customers',
  /** Endpoint to list customers */
  LIST: '/customers',
  /** Endpoint to get a customer by ID */
  GET: (id: string) => `/customers/${id}`,
  /** Endpoint to update a customer */
  UPDATE: (id: string) => `/customers/${id}`,
  /** Endpoint to create a KYC session */
  KYC: (id: string) => `/customers/${id}/kyc`,
  VIRTUAL_ACCOUNT: (id: string) => `/customers/${id}/virtual-account`,
  WALLET_OWNERSHIP: (id: string) => `/customers/${id}/wallet-ownership`,
  EXTERNAL_ACCOUNT: (id: string) => `/customers/${id}/external-accounts`,
} as const;
