import { z } from 'zod';

const AddressSchema = z.object({
  country: z.string().length(2),
  city: z.string().min(1),
  street_line_1: z.string().min(1),
  postal_code: z.string().min(1),
});

export const CreateExternalAccountSchema = z.object({
  bank_name: z.string().min(1),
  account_holder_type: z.enum(['individual', 'business']),
  account_holder_first_name: z.string().optional(),
  account_holder_last_name: z.string().optional(),
  account_holder_business_name: z.string().optional(),
  account_holder_address: AddressSchema,
  account_type: z.enum(['iban', 'us']),
  iban: z.object({
    bic: z.string(),
    iban_number: z.string(),
  }).optional(),
  us: z.object({
    account_number: z.string(),
    routing_number: z.string(),
  }).optional(),
}).refine(data => {
  if (data.account_type === 'iban') return !!data.iban;
  if (data.account_type === 'us') return !!data.us;
  return false;
}, {
  message: "Either 'iban' or 'us' details must be provided matching the account_type",
});
