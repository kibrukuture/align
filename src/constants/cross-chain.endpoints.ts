/**
 * API endpoints for Cross-Chain Transfer management.
 */
export const CROSS_CHAIN_ENDPOINTS = {
  /** Endpoint to create a cross-chain quote */
  QUOTE: '/cross-chain/quote',
  /** Endpoint to create a cross-chain transfer */
  CREATE: '/cross-chain',
  /** Endpoint to list permanent routes */
  ROUTES: '/cross-chain/routes',
  /** Endpoint to create a permanent route */
  CREATE_ROUTE: '/cross-chain/routes',
  /** Endpoint to get a cross-chain transfer by ID */
  GET: (id: string) => `/cross-chain/transfer/${id}`,
} as const;
