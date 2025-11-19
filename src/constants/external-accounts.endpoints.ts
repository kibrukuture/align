/**
 * API endpoints for External Account management.
 */
export const EXTERNAL_ACCOUNT_ENDPOINTS = {
  /** Endpoint to create an external account */
  CREATE: '/external-accounts',
  /** Endpoint to get an external account by ID */
  GET: (id: string) => `/external-accounts/${id}`,
} as const;
