import { z } from 'zod';

export const CreateVirtualAccountSchema = z.object({
  source_currency: z.enum(['usd', 'eur']),
  destination_token: z.enum(['usdc', 'usdt']),
  destination_network: z.enum(['polygon', 'ethereum', 'solana', 'base']),
  destination_address: z.string().optional(),
});
