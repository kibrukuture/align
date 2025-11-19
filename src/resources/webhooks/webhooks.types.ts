export interface Webhook {
  id: string;
  url: string;
  status: string;
  created_at: string;
}

export interface CreateWebhookRequest {
  url: string;
}

export interface WebhookEvent<T = unknown> {
  id: string;
  type: string;
  created_at: string;
  data: T;
}
