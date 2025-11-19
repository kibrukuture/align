import { z } from 'zod';

export const CreateWebhookSchema = z.object({
  url: z.url().max(1024),
});
