/**
 * API endpoints for Transfer management.
 */
export const TRANSFER_ENDPOINTS = {
  /** Endpoint to create an offramp quote */
  OFFRAMP_QUOTE: (customerId: string) =>
    `/v0/customers/${customerId}/offramp-transfer/quote`,

  /** Endpoint to create an offramp transfer from a quote */
  OFFRAMP_CREATE: (customerId: string, quoteId: string) =>
    `/v0/customers/${customerId}/offramp-transfer/quote/${quoteId}`,

  /** Endpoint to complete an offramp transfer */
  OFFRAMP_COMPLETE: (customerId: string, transferId: string) =>
    `/v0/customers/${customerId}/offramp-transfer/${transferId}/complete`,

  /** Endpoint to list offramp transfers */
  OFFRAMP_LIST: (customerId: string) =>
    `/v0/customers/${customerId}/offramp-transfer`,

  /** Endpoint to get an offramp transfer by ID */
  OFFRAMP_GET: (customerId: string, transferId: string) =>
    `/v0/customers/${customerId}/offramp-transfer/${transferId}`,

  /** Endpoint to simulate transfer actions (Sandbox only) */
  SIMULATE: (customerId: string) =>
    `/v0/customers/${customerId}/offramp-transfer/simulate`,

  // Onramp endpoints
  /** Endpoint to create an onramp quote */
  ONRAMP_QUOTE: (customerId: string) =>
    `/v0/customers/${customerId}/onramp-transfer/quote`,

  /** Endpoint to create an onramp transfer from a quote */
  ONRAMP_CREATE: (customerId: string, quoteId: string) =>
    `/v0/customers/${customerId}/onramp-transfer/quote/${quoteId}`,

  /** Endpoint to list onramp transfers */
  ONRAMP_LIST: (customerId: string) =>
    `/v0/customers/${customerId}/onramp-transfer`,

  /** Endpoint to get an onramp transfer by ID */
  ONRAMP_GET: (customerId: string, transferId: string) =>
    `/v0/customers/${customerId}/onramp-transfer/${transferId}`,

  /** Endpoint to simulate onramp transfer actions (Sandbox only) */
  ONRAMP_SIMULATE: (customerId: string) =>
    `/v0/customers/${customerId}/onramp-transfer/simulate`,
} as const;
