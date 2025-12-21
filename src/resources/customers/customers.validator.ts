import { z } from "zod/v4";

const CustomerDocumentSchema = z.object({
  file_id: z.uuid(),
  purpose: z.enum([
    "id_document",
    "proof_of_address",
    "proof_of_source_of_funds",
    "business_formation",
    "directors_registry",
    "shareholder_registry",
    "proof_of_nature_of_business",
    "other",
  ]),
  description: z.string().optional(),
});

export const CreateCustomerSchema = z.object({
  email: z.email(),
  type: z.enum(["individual", "corporate"]),
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  company_name: z.string().min(1).optional(),
});

export const UpdateCustomerSchema = z.object({
  documents: z.array(CustomerDocumentSchema),
});

export const SimulateCustomerSchema = z.object({
  action: z.enum(["kyc.status.approve"]),
  customer_id: z.string(),
});
