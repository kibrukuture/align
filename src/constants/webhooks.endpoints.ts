/**
 * API endpoints for Webhook management.
 */
export const WEBHOOK_ENDPOINTS = {
  /** Endpoint to create a webhook */
  CREATE: "/v0/webhooks",
  /** Endpoint to list webhooks */
  LIST: "/v0/webhooks",
  /** Endpoint to delete a webhook by ID */
  DELETE: (id: string) => `/v0/webhooks/${id}`,
} as const;
