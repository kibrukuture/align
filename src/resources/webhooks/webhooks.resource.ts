import * as crypto from 'node:crypto';
import { HttpClient } from '@/core/http-client';
import { AlignValidationError } from '@/core/errors';
import { formatZodError } from '@/core/validation';
import type { 
  CreateWebhookRequest, 
  Webhook, 
  WebhookListResponse 
} from '@/resources/webhooks/webhooks.types';
import { CreateWebhookSchema } from '@/resources/webhooks/webhooks.validator';
import { WEBHOOK_ENDPOINTS } from '@/constants';
import { createHmac } from 'crypto';

export class WebhooksResource {
  constructor(private client: HttpClient) {}

  /**
   * Create a new webhook subscription
   * 
   * @param data - Webhook creation data
   * @returns Promise resolving to the created webhook
   * @throws {AlignValidationError} If the webhook data is invalid
   * 
   * @example
   * ```typescript
   * const webhook = await align.webhooks.create({
   *   url: 'https://api.example.com/webhooks',
   *   events: ['payment.received', 'kyc.updated'],
   * });
   * ```
   */
  public async create(data: CreateWebhookRequest): Promise<Webhook> {
    const validation = CreateWebhookSchema.safeParse(data);
    if (!validation.success) {
      throw new AlignValidationError('Invalid webhook data', formatZodError(validation.error));
    }

    return this.client.post<Webhook>(WEBHOOK_ENDPOINTS.CREATE, data);
  }

  /**
   * List all registered webhooks
   * 
   * @returns Promise resolving to a list of webhooks wrapped in a response object
   * 
   * @example
   * ```typescript
   * const response = await align.webhooks.list();
   * response.items.forEach(webhook => {
   *   console.log(`${webhook.id}: ${webhook.url}`);
   * });
   * ```
   */
  public async list(): Promise<WebhookListResponse> {
    return this.client.get<WebhookListResponse>(WEBHOOK_ENDPOINTS.LIST);
  }

  /**
   * Delete a webhook endpoint
   * 
   * @param id - The unique identifier of the webhook to delete
   * @returns Promise that resolves when the webhook is deleted
   * 
   * @example
   * ```typescript
   * await align.webhooks.delete('wh_abc123');
   * console.log('Webhook deleted successfully');
   * ```
   */
  public async delete(id: string): Promise<void> {
    return this.client.delete<void>(WEBHOOK_ENDPOINTS.DELETE(id));
  }

  /**
   * Verify webhook signature using HMAC-SHA256
   * 
   * This method verifies that a webhook request genuinely came from AlignLab by validating
   * the HMAC-SHA256 signature sent in the `x-hmac-signature` header.
   * 
   * @param payload - The raw request body as a string (must be the exact bytes received)
   * @param signature - The signature from the `x-hmac-signature` header
   * @param secret - Your AlignLab API key (used as the HMAC secret)
   * @returns `true` if the signature is valid, `false` otherwise
   * 
   * @remarks
   * - Uses `crypto.timingSafeEqual` to prevent timing attacks
   * - The payload must be the raw request body before any parsing
   * - The secret should be your AlignLab API key
   * 
   * @example
   * ```typescript
   * import express from 'express';
   * 
   * app.post('/webhooks/alignlab', 
   *   express.raw({ type: 'application/json' }), 
   *   (req, res) => {
   *     const signature = req.headers['x-hmac-signature'] as string;
   *     const payload = req.body.toString('utf8');
   *     const apiKey = process.env.ALIGNLAB_API_KEY!;
   * 
   *     const isValid = align.webhooks.verifySignature(payload, signature, apiKey);
   *     
   *     if (!isValid) {
   *       return res.status(401).send('Invalid signature');
   *     }
   * 
   *     // Process the webhook...
   *     res.status(200).send('OK');
   *   }
   * );
   * ```
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
