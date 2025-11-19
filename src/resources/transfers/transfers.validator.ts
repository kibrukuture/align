import { z } from 'zod';

export const CreateOfframpQuoteSchema = z.object({
  source_amount: z.string().regex(/^[0-9]+(\.[0-9]+)?$/).optional(),
  destination_amount: z.string().regex(/^[0-9]+(\.[0-9]+)?$/).optional(),
  source_token: z.enum(['usdc', 'usdt', 'eurc']),
  source_network: z.enum(['polygon', 'ethereum', 'solana', 'base', 'arbitrum', 'tron']),
  destination_currency: z.enum(['usd', 'eur', 'aed']),
  destination_payment_rails: z.enum(['ach', 'wire', 'sepa', 'swift', 'uaefts']),
  developer_fee_percent: z.string().optional(),
}).refine(data => data.source_amount || data.destination_amount, {
  message: "Either source_amount or destination_amount must be provided",
});

export const CreateOnrampQuoteSchema = z.object({
  source_amount: z.string().regex(/^[0-9]+(\.[0-9]+)?$/).optional(),
  destination_amount: z.string().regex(/^[0-9]+(\.[0-9]+)?$/).optional(),
  source_currency: z.enum(['usd', 'eur', 'aed']),
  source_payment_rails: z.enum(['ach', 'wire', 'sepa', 'uaefts']),
  destination_token: z.enum(['usdc', 'usdt', 'eurc']),
  destination_network: z.enum(['polygon', 'ethereum', 'solana', 'base', 'tron']),
  developer_fee_percent: z.string().optional(),
}).refine(data => data.source_amount || data.destination_amount, {
  message: "Either source_amount or destination_amount must be provided",
});
