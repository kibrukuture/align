import * as crypto from 'node:crypto';
import { HttpClient } from '@/core/http-client';
import { AlignValidationError } from '@/core/errors';
import type { Webhook, CreateWebhookRequest } from '@/resources/webhooks/webhooks.types';
import { CreateWebhookSchema } from '@/resources/webhooks/webhooks.validator';
import { WEBHOOK_ENDPOINTS } from '@/constants';

export class WebhooksResource {
  constructor(private client: HttpClient) {}

  /**
   * Create a new webhook
   */
  public async create(data: CreateWebhookRequest): Promise<Webhook> {
    const validation = CreateWebhookSchema.safeParse(data);
    if (!validation.success) {
      throw new AlignValidationError('Invalid webhook data', validation.error.flatten().fieldErrors as Record<string, string[]>);
    }

    return this.client.post<Webhook>(WEBHOOK_ENDPOINTS.CREATE, data);
  }

  /**
   * List all webhooks
   */
  public async list(): Promise<Webhook[]> {
    return this.client.get<Webhook[]>(WEBHOOK_ENDPOINTS.LIST);
  }

  /**
   * Delete a webhook
   */
  public async delete(id: string): Promise<void> {
    return this.client.delete<void>(WEBHOOK_ENDPOINTS.DELETE(id));
  }

  /**
   * Verify webhook signature
   * Uses HMAC-SHA256 to verify that the payload was signed with the secret.
   */
  public verifySignature(payload: string, signature: string, secret: string): boolean {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(payload).digest('hex');
    
    // Use timingSafeEqual to prevent timing attacks
    const signatureBuffer = Buffer.from(signature);
    const digestBuffer = Buffer.from(digest);

    if (signatureBuffer.length !== digestBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, digestBuffer);
  }
}
