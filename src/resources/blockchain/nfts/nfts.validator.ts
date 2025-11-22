import { z } from "zod/v4";
import {
  WalletAddressSchema,
  NetworkSchema,
} from "@/resources/blockchain/wallets/wallets.validator";

export const NFTContractSchema = z.object({
  contractAddress: WalletAddressSchema,
  tokenId: z.string().min(1, "Token ID is required"),
  network: NetworkSchema,
});

export const NFTTransferSchema = NFTContractSchema.extend({
  wallet: z.object({
    address: WalletAddressSchema,
    privateKey: z.string(),
  }),
  to: WalletAddressSchema,
  amount: z.string().optional(), // Optional for ERC-721, required for ERC-1155 batch/single if needed
});
