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
   * Create a new customer account
   * 
   * @param data - Customer information
   * @param data.email - Customer's email address
   * @param data.first_name - Customer's first name
   * @param data.last_name - Customer's last name
   * @param data.type - Customer type: 'individual' or 'business'
   * @returns Promise resolving to the created customer object
   * @throws {AlignValidationError} If the customer data is invalid
   * 
   * @example
   * ```typescript
   * const customer = await align.customers.create({
   *   email: 'alice@example.com',
   *   first_name: 'Alice',
   *   last_name: 'Smith',
   *   type: 'individual',
   * });
   * console.log(customer.id); // "cus_abc123"
   * ```
   */
  public async create(data: CreateCustomerRequest): Promise<Customer> {
    const validation = CreateCustomerSchema.safeParse(data);
    if (!validation.success) {
      throw new AlignValidationError('Invalid customer data', validation.error.flatten().fieldErrors as Record<string, string[]>);
    }

    return this.client.post<Customer>(CUSTOMER_ENDPOINTS.CREATE, data);
  }

  /**
   * Retrieve a customer by their unique identifier
   * 
   * @param id - The unique customer identifier
   * @returns Promise resolving to the customer object
   * 
   * @example
   * ```typescript
   * const customer = await align.customers.get('cus_abc123');
   * console.log(customer.email); // "alice@example.com"
   * console.log(customer.kyc_status); // "approved"
   * ```
   */
  public async get(id: string): Promise<Customer> {
    return this.client.get<Customer>(CUSTOMER_ENDPOINTS.GET(id));
  }

  /**
   * Update an existing customer's information
   * 
   * @param id - The unique customer identifier
   * @param data - Updated customer information
   * @param data.email - Updated email address (optional)
   * @param data.first_name - Updated first name (optional)
   * @param data.last_name - Updated last name (optional)
   * @returns Promise resolving to the updated customer object
   * @throws {AlignValidationError} If the update data is invalid
   * 
   * @example
   * ```typescript
   * const updatedCustomer = await align.customers.update('cus_abc123', {
   *   email: 'alice.smith@example.com',
   *   first_name: 'Alice Marie',
   * });
   * console.log(updatedCustomer.email); // "alice.smith@example.com"
   * ```
   */
  public async update(id: string, data: UpdateCustomerRequest): Promise<Customer> {
    const validation = UpdateCustomerSchema.safeParse(data);
    if (!validation.success) {
      throw new AlignValidationError('Invalid update data', validation.error.flatten().fieldErrors as Record<string, string[]>);
    }

    return this.client.patch<Customer>(CUSTOMER_ENDPOINTS.UPDATE(id), data);
  }

  /**
   * List all customers with pagination
   * 
   * @param page - Page number (1-indexed)
   * @param limit - Number of customers per page
   * @returns Promise resolving to a paginated list of customers
   * 
   * @example
   * ```typescript
   * const customers = await align.customers.list(1, 20);
   * console.log(customers.data.length); // 20
   * console.log(customers.has_more); // true
   * console.log(customers.total_count); // 156
   * ```
   */
  public async list(page = 1, limit = 10): Promise<CustomerListResponse> {
    return this.client.get<CustomerListResponse>(CUSTOMER_ENDPOINTS.LIST, { page, limit });
  }

  /**
   * Create a KYC (Know Your Customer) verification session
   * 
   * Generates a unique KYC session URL that the customer can use to complete
   * their identity verification process.
   * 
   * @param customerId - The unique customer identifier
   * @returns Promise resolving to the KYC session details including the verification URL
   * 
   * @example
   * ```typescript
   * const kycSession = await align.customers.createKycSession('cus_abc123');
   * console.log(kycSession.url); // "https://kyc.alignlabs.dev/session/..."
   * console.log(kycSession.session_id); // "kyc_session_xyz"
   * console.log(kycSession.status); // "pending"
   * 
   * // Redirect user to kycSession.url to complete KYC
   * ```
   */
  public async createKycSession(customerId: string): Promise<KycSessionResponse> {
    return this.client.post<KycSessionResponse>(CUSTOMER_ENDPOINTS.KYC(customerId));
  }
}
