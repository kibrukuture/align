/**
 * Type of money movement service for developer fees
 */
export type ServiceType = 'onramp' | 'offramp' | 'cross_chain_transfer';

/**
 * How the fee is calculated
 */
export type AccrualBasis = 'percentage';

/**
 * Individual developer receivable fee configuration
 */
export interface DeveloperReceivableFee {
  /** Type of money movement service */
  service_type: ServiceType;
  /** How the fee is calculated */
  accrual_basis: AccrualBasis;
  /** Fee percentage value */
  value: number;
}

/**
 * Response structure for developer fees
 */
export interface DeveloperFeesResponse {
  /** Array of developer receivable fee configurations */
  developer_receivable_fees: DeveloperReceivableFee[];
}

/**
 * Request structure for updating developer fees
 */
export interface UpdateDeveloperFeesRequest {
  /** Developer receivable fees by service type */
  developer_receivable_fees: {
    /** Fee percentage for onramp transactions */
    onramp?: number;
    /** Fee percentage for offramp transactions */
    offramp?: number;
    /** Fee percentage for cross chain transfers */
    cross_chain_transfer?: number;
  };
}
