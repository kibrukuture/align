import { z } from 'zod';

export const CreateCrossChainTransferSchema = z.object({
  amount: z.string().regex(/^[0-9]+(\.[0-9]+)?$/),
  source_network: z.enum(['polygon', 'ethereum', 'tron', 'solana']),
  source_token: z.enum(['usdc', 'usdt']),
  destination_network: z.enum(['polygon', 'ethereum', 'tron', 'solana']),
  destination_token: z.enum(['usdc', 'usdt']),
  destination_address: z.string().min(1),
});

export const CompleteCrossChainTransferSchema = z.object({
  deposit_transaction_hash: z.string().min(1),
});

export const CreatePermanentRouteSchema = z.object({
  destination_network: z.enum(['polygon', 'ethereum']),
  destination_token: z.enum(['usdc', 'usdt']),
  destination_address: z.string().min(1),
});
