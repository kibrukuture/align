import { z } from 'zod/v4';

export const CreateWebhookSchema = z.object({
  url: z.url().max(1024),
});
