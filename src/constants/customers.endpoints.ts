/**
 * API endpoints for Customer management.
 */
export const CUSTOMER_ENDPOINTS = {
  /** Endpoint to create a new customer */
  CREATE: "/v0/customers",
  /** Endpoint to list customers */
  LIST: "/v0/customers",
  /** Endpoint to get a customer by ID */
  GET: (id: string) => `/v0/customers/${id}`,
  /** Endpoint to update a customer */
  UPDATE: (id: string) => `/v0/customers/${id}`,
  /** Endpoint to create a KYC session */
  KYC: (id: string) => `/v0/customers/${id}/kycs`,
  VIRTUAL_ACCOUNT: (id: string) => `/v0/customers/${id}/virtual-account`,
  WALLET_OWNERSHIP: (id: string) => `/v0/customers/${id}/wallet-ownership`,
  EXTERNAL_ACCOUNT: (id: string) => `/v0/customers/${id}/external-accounts`,
} as const;
