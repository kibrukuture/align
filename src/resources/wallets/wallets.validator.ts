import { z } from 'zod/v4';

export const VerifyWalletSchema = z.object({
  wallet_address: z.string().min(1, 'Wallet address is required'),
});
