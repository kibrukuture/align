import { z } from 'zod';

export const VerifyWalletSchema = z.object({
  wallet_address: z.string().min(1, 'Wallet address is required'),
});
