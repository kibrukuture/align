export type AlignEnvironment = "sandbox" | "production";

export interface AlignConfig {
  apiKey: string;
  environment: AlignEnvironment;
}

export interface AlignResponse<T> {
  data: T;
  status: number;
  error?: string;
}

/**
 * KYC verification status
 */
export type KycStatus = "pending" | "approved" | "rejected" | "not_started";

/**
 * Webhook status
 */
export type WebhookStatus = "active" | "inactive";

/**
 * Customer type
 */
export type CustomerType = "individual" | "corporate";
