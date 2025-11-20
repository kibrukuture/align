/**
 * API endpoints for Cross-Chain Transfer management.
 */
export const CROSS_CHAIN_ENDPOINTS = {
  /** Endpoint to create a cross-chain transfer */
  CREATE: (customerId: string) =>
    `/v0/customers/${customerId}/cross-chain-transfer`,

  /** Endpoint to complete a cross-chain transfer */
  COMPLETE: (customerId: string, transferId: string) =>
    `/v0/customers/${customerId}/cross-chain-transfer/${transferId}/complete`,

  /** Endpoint to get a cross-chain transfer by ID */
  GET: (customerId: string, transferId: string) =>
    `/v0/customers/${customerId}/cross-chain-transfer/${transferId}`,

  /** Endpoint to create a permanent route address */
  CREATE_ROUTE: (customerId: string) =>
    `/v0/customers/${customerId}/cross-chain-transfer/permanent-route-address`,

  /** Endpoint to get a permanent route address by ID */
  GET_ROUTE: (customerId: string, addressId: string) =>
    `/v0/customers/${customerId}/cross-chain-transfer/permanent-route-address/${addressId}`,

  /** Endpoint to list permanent route addresses */
  LIST_ROUTES: (customerId: string) =>
    `/v0/customers/${customerId}/cross-chain-transfer/permanent-route-address/list`,
} as const;
