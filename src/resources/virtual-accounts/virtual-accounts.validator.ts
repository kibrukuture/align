import { z } from 'zod/v4';

export const CreateVirtualAccountSchema = z.object({
  source_currency: z.enum(['usd', 'eur', 'aed']),
  source_rails: z.enum(['swift']).optional(),
  destination_token: z.enum(['usdc', 'usdt']),
  destination_network: z.enum(['polygon', 'ethereum', 'solana', 'base', 'tron', 'arbitrum']),
  destination_address: z.string().min(1),
});
