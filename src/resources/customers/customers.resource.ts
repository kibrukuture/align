import { HttpClient } from '@/core/http-client';
import { AlignValidationError } from '@/core/errors';
import type { 
  CreateCustomerRequest, 
  Customer, 
  CustomerListResponse, 
  KycSessionResponse, 
  UpdateCustomerRequest 
} from '@/resources/customers/customers.types';
import { CreateCustomerSchema, UpdateCustomerSchema } from '@/resources/customers/customers.validator';
import { CUSTOMER_ENDPOINTS } from '@/constants';

export class CustomersResource {
  constructor(private client: HttpClient) {}

  /**
   * Create a new customer
   */
  public async create(data: CreateCustomerRequest): Promise<Customer> {
    const validation = CreateCustomerSchema.safeParse(data);
    if (!validation.success) {
      throw new AlignValidationError('Invalid customer data', validation.error.flatten().fieldErrors as Record<string, string[]>);
    }

    return this.client.post<Customer>(CUSTOMER_ENDPOINTS.CREATE, data);
  }

  /**
   * Get a customer by ID
   */
  public async get(id: string): Promise<Customer> {
    return this.client.get<Customer>(CUSTOMER_ENDPOINTS.GET(id));
  }

  /**
   * Update a customer
   */
  public async update(id: string, data: UpdateCustomerRequest): Promise<Customer> {
    const validation = UpdateCustomerSchema.safeParse(data);
    if (!validation.success) {
      throw new AlignValidationError('Invalid update data', validation.error.flatten().fieldErrors as Record<string, string[]>);
    }

    return this.client.patch<Customer>(CUSTOMER_ENDPOINTS.UPDATE(id), data);
  }

  /**
   * List all customers
   */
  public async list(page = 1, limit = 10): Promise<CustomerListResponse> {
    return this.client.get<CustomerListResponse>(CUSTOMER_ENDPOINTS.LIST, { page, limit });
  }

  /**
   * Create a KYC session for a customer
   */
  public async createKycSession(customerId: string): Promise<KycSessionResponse> {
    return this.client.post<KycSessionResponse>(CUSTOMER_ENDPOINTS.KYC(customerId));
  }
}
