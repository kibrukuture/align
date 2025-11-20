import type { WebhookStatus } from '@/types/common';

/**
 * Webhook event types
 */
export type WebhookEventType =
  | 'customer.kycs.updated'
  | 'onramp_transfer.status.updated'
  | 'offramp_transfer.status.updated';

/**
 * Webhook entity types
 */
export type WebhookEntityType =
  | 'customer'
  | 'onramp_transfer'
  | 'offramp_transfer';

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

/**
 * Webhook event payload structure
 * This is what you receive when a webhook is triggered
 */
export interface WebhookEvent {
  event_type: WebhookEventType;
  entity_id: string;
  entity_type: WebhookEntityType;
  created_at: string;
}
