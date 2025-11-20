import { z } from 'zod/v4';

export const UpdateDeveloperFeesSchema = z.object({
  developer_receivable_fees: z.object({
    onramp: z.number().min(0).max(100).optional(),
    offramp: z.number().min(0).max(100).optional(),
    cross_chain_transfer: z.number().min(0).max(100).optional(),
  }),
});
