/**
 * API endpoints for Transfer management.
 */
export const TRANSFER_ENDPOINTS = {
  /** Endpoint to create an offramp quote */
  OFFRAMP_QUOTE: '/transfers/offramp/quote',
  /** Endpoint to create an onramp quote */
  ONRAMP_QUOTE: '/transfers/onramp/quote',
  /** Endpoint to create an offramp transfer from a quote */
  OFFRAMP_CREATE: '/transfers/offramp',
  /** Endpoint to create an onramp transfer */
  ONRAMP_CREATE: '/transfers/onramp',
  /** Endpoint to list offramp transfers */
  OFFRAMP_LIST: '/transfers/offramp',
  /** Endpoint to list onramp transfers */
  ONRAMP_LIST: '/transfers/onramp',
  /** Endpoint to get an offramp transfer by ID */
  OFFRAMP_GET: (id: string) => `/transfers/offramp/${id}`,
  /** Endpoint to get an onramp transfer by ID */
  ONRAMP_GET: (id: string) => `/transfers/onramp/${id}`,
  /** Endpoint to simulate a transfer (sandbox only) */
  SIMULATE: (id: string) => `/transfers/${id}/simulate`,
} as const;
