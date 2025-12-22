import type { CustomerType, KycStatus, WebhookStatus } from "@/types/common";
import type { KycSubStatus } from "@/resources/customers/customers.types";
import type {
  FiatCurrency,
  PaymentRail,
} from "@/resources/transfers/transfers.types";

/**
 * Webhook event types
 */
export type WebhookEventType =
  | "customer.kycs.updated"
  | "onramp_transfer.status.updated"
  | "cross_chain_transfer.status.updated"
  | "offramp_transfer.status.updated"
  | "virtual_account.created";

/**
 * Webhook entity types
 */
export type WebhookEntityType =
  | "customer"
  | "onramp_transfer"
  | "cross_chain_transfer"
  | "offramp_transfer"
  | "virtual_account";

export interface Webhook {
  id: string;
  url: string;
  status: WebhookStatus;
  created_at: string;
}

export interface CreateWebhookRequest {
  url: string;
}

export interface WebhookListResponse {
  items: Webhook[];
}

export type CustomerKycsUpdatedEventPayload = {
  kycs: {
    status: KycStatus;
    sub_status: KycSubStatus | null;
    kyc_flow_link: string;
    status_breakdown: {
      status: KycStatus;
      currency: FiatCurrency;
      payment_rails: PaymentRail;
    }[];
  };
  type: CustomerType;
  email: string;
  address: {
    city: string;
    country: string;
    postal_code: string;
    street_line_1: string;
  };
  last_name: string;
  first_name: string;
  customer_id: string;
  company_name: string | null;
};

/**
 * Webhook event payload structure
 * This is what you receive when a webhook is triggered
 */
/**
 * Customer KYC status updated
 */
export interface CustomerKycUpdatedEvent {
  event_type: "customer.kycs.updated";
  entity_id: string;
  entity_type: "customer";
  created_at: string;
}

/**
 * Onramp transfer status updated
 */
export interface OnrampTransferStatusUpdatedEvent {
  event_type: "onramp_transfer.status.updated";
  entity_id: string;
  entity_type: "onramp_transfer";
  created_at: string;
}

/**
 * Offramp transfer status updated
 */
export interface OfframpTransferStatusUpdatedEvent {
  event_type: "offramp_transfer.status.updated";
  entity_id: string;
  entity_type: "offramp_transfer";
  created_at: string;
}

/**
 * Cross chain transfer status updated
 */
export interface CrossChainTransferStatusUpdatedEvent {
  event_type: "cross_chain_transfer.status.updated";
  entity_id: string;
  entity_type: "cross_chain_transfer";
  created_at: string;
  event_payload?: {
    permanent_route_address?: {
      id: string;
    };
  };
}

/**
 * Virtual account created
 */
export interface VirtualAccountCreatedEvent {
  event_type: "virtual_account.created";
  entity_id: string;
  entity_type: "virtual_account";
  created_at: string;
}

/**
 * Webhook event payload structure
 * This is what you receive when a webhook is triggered
 */
export type WebhookEvent =
  | CustomerKycUpdatedEvent
  | OnrampTransferStatusUpdatedEvent
  | CrossChainTransferStatusUpdatedEvent
  | OfframpTransferStatusUpdatedEvent
  | VirtualAccountCreatedEvent;
