/**
 * API endpoints for External Account management.
 */
export const EXTERNAL_ACCOUNT_ENDPOINTS = {
  /** Endpoint to create an external account for a customer */
  CREATE: (customerId: string) => `/v0/customers/${customerId}/external-accounts`,
  /** Endpoint to list all external accounts for a customer */
  LIST: (customerId: string) => `/v0/customers/${customerId}/external-accounts`,
} as const;
