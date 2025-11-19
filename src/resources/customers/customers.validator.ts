import { z } from 'zod';

export const CreateCustomerSchema = z.object({
  email: z.email(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  type: z.enum(['individual', 'business']),
});

export const UpdateCustomerSchema = z.object({
  email: z.email().optional(),
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
});
