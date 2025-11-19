/**
 * API endpoints for Virtual Account management.
 */
export const VIRTUAL_ACCOUNT_ENDPOINTS = {
  /** Endpoint to create a virtual account */
  CREATE: '/virtual-accounts',
  /** Endpoint to list virtual accounts */
  LIST: '/virtual-accounts',
  /** Endpoint to get a virtual account by ID */
  GET: (id: string) => `/virtual-accounts/${id}`,
} as const;
