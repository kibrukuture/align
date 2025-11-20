/**
 * API endpoints for Virtual Account management.
 */
export const VIRTUAL_ACCOUNT_ENDPOINTS = {
  /** Endpoint to create a virtual account */
  CREATE: (customerId: string) => `/v0/customers/${customerId}/virtual-account`,
  /** Endpoint to get a virtual account by ID */
  GET: (customerId: string, virtualAccountId: string) => `/v0/customers/${customerId}/virtual-account/${virtualAccountId}`,
  /** Endpoint to list virtual accounts */
  LIST: (customerId: string) => `/v0/customers/${customerId}/virtual-account`,
} as const;
