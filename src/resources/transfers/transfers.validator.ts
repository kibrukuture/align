import { z } from 'zod/v4';

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

const AddressSchema = z.object({
  country: z.string().length(2),
  city: z.string().min(1),
  street_line_1: z.string().min(1),
  postal_code: z.string().min(1),
});

const IbanAccountDetailsSchema = z.object({
  bank_name: z.string().min(1),
  account_holder_type: z.enum(['individual', 'business']),
  account_holder_first_name: z.string().optional(),
  account_holder_last_name: z.string().optional(),
  account_holder_business_name: z.string().optional(),
  account_holder_address: AddressSchema,
  account_type: z.literal('iban'),
  iban: z.object({
    bic: z.string(),
    iban_number: z.string(),
  }),
});

const UsAccountDetailsSchema = z.object({
  bank_name: z.string().min(1),
  account_holder_type: z.enum(['individual', 'business']),
  account_holder_first_name: z.string().optional(),
  account_holder_last_name: z.string().optional(),
  account_holder_business_name: z.string().optional(),
  account_holder_address: AddressSchema,
  account_type: z.literal('us'),
  us: z.object({
    account_number: z.string(),
    routing_number: z.string(),
  }),
});

export const CreateOfframpTransferSchema = z.object({
  transfer_purpose: z.enum([
    'charity', 'commercial_investment', 'corporate_card', 'credit_card', 'dividend',
    'family', 'financial_services', 'good_sold', 'goods_bought', 'government',
    'insurance', 'intergroup_transfer', 'intra_group_dividends', 'information_technology',
    'leasing', 'loan_charges', 'merchant_settlement', 'mobile_wallet', 'none',
    'non_resident_transfer_between_accounts', 'pension', 'personal_expenses',
    'prepaid_cards', 'professional', 'rental', 'resident_transfer_between_accounts',
    'salaries', 'telecommunications', 'travel', 'utility_bill'
  ]),
  destination_external_account_id: z.string().uuid().optional(),
  destination_bank_account: z.union([IbanAccountDetailsSchema, UsAccountDetailsSchema]).optional(),
}).refine(data => !!data.destination_external_account_id !== !!data.destination_bank_account, {
  message: "Either destination_external_account_id OR destination_bank_account must be provided, but not both",
});

// Alias for backward compatibility if needed, but we should use specific schemas
export const CreateTransferFromQuoteSchema = CreateOfframpTransferSchema;

export const CreateOnrampTransferSchema = z.object({
  destination_address: z.string().min(1),
});

export const CompleteOfframpTransferSchema = z.object({
  deposit_transaction_hash: z.string().min(1),
});

export const SimulateOfframpTransferSchema = z.object({
  action: z.literal('complete_transfer'),
  transfer_id: z.uuid(),
});

export const SimulateOnrampTransferSchema = z.object({
  action: z.literal('complete_transfer'),
  transfer_id: z.uuid(),
});
