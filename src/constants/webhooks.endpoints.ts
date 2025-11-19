/**
 * API endpoints for Webhook management.
 */
export const WEBHOOK_ENDPOINTS = {
  /** Endpoint to create a webhook */
  CREATE: '/webhooks',
  /** Endpoint to list webhooks */
  LIST: '/webhooks',
  /** Endpoint to delete a webhook by ID */
  DELETE: (id: string) => `/webhooks/${id}`,
} as const;
