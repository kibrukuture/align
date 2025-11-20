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
   * @param data.email - Customer's email address (required)
   * @param data.type - Customer type: 'individual' or 'corporate' (required)
   * @param data.first_name - Customer's first name (required for individual)
   * @param data.last_name - Customer's last name (required for individual)
   * @param data.company_name - Company name (required for corporate)
   * @returns Promise resolving to the created customer object
   * @throws {AlignValidationError} If the customer data is invalid
   * 
   * @example
   * ```typescript
   * // Individual customer
   * const customer = await align.customers.create({
   *   email: 'alice@example.com',
   *   type: 'individual',
   *   first_name: 'Alice',
   *   last_name: 'Smith',
   * });
   * console.log(customer.customer_id); // "123e4567-e89b-12d3-a456-426614174000"
   * 
   * // Corporate customer
   * const company = await align.customers.create({
   *   email: 'contact@acme.com',
   *   type: 'corporate',
   *   company_name: 'Acme Corporation',
   * });
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
   * @param customerId - The unique customer identifier (UUID)
   * @returns Promise resolving to the customer object
   * 
   * @example
   * ```typescript
   * const customer = await align.customers.get('123e4567-e89b-12d3-a456-426614174000');
   * console.log(customer.email); // "alice@example.com"
   * console.log(customer.kycs?.sub_status); // "kyc_form_submission_accepted"
   * ```
   */
  public async get(customerId: string): Promise<Customer> {
    return this.client.get<Customer>(CUSTOMER_ENDPOINTS.GET(customerId));
  }

  /**
   * Update an existing customer's information with documents
   * 
   * @param customerId - The unique customer identifier (UUID)
   * @param data - Update data with documents array
   * @param data.documents - Array of document objects to upload
   * @returns Promise resolving to an empty object on success
   * @throws {AlignValidationError} If the update data is invalid
   * 
   * @example
   * ```typescript
   * const result = await align.customers.update('123e4567-e89b-12d3-a456-426614174000', {
   *   documents: [
   *     {
   *       file_id: '123e4567-e89b-12d3-a456-426614174001',
   *       purpose: 'id_document',
   *       description: 'Driver license',
   *     },
   *     {
   *       file_id: '123e4567-e89b-12d3-a456-426614174002',
   *       purpose: 'proof_of_address',
   *     },
   *   ],
   * });
   * ```
   */
  public async update(customerId: string, data: UpdateCustomerRequest): Promise<Record<string, never>> {
    const validation = UpdateCustomerSchema.safeParse(data);
    if (!validation.success) {
      throw new AlignValidationError('Invalid update data', validation.error.flatten().fieldErrors as Record<string, string[]>);
    }

    return this.client.put<Record<string, never>>(CUSTOMER_ENDPOINTS.UPDATE(customerId), data);
  }

  /**
   * List all customers with optional email filter
   * 
   * @param email - Optional email filter to search for specific customer
   * @returns Promise resolving to a list of customers
   * 
   * @example
   * ```typescript
   * // List all customers
   * const allCustomers = await align.customers.list();
   * console.log(allCustomers.items.length);
   * 
   * // Filter by email
   * const filtered = await align.customers.list('alice@example.com');
   * console.log(filtered.items[0].customer_id);
   * ```
   */
  public async list(email?: string): Promise<CustomerListResponse> {
    const params = email ? { email } : undefined;
    return this.client.get<CustomerListResponse>(CUSTOMER_ENDPOINTS.LIST, params);
  }

  /**
   * Create a KYC (Know Your Customer) verification session
   * 
   * Generates a unique KYC flow link that the customer can use to complete
   * their identity verification process.
   * 
   * @param customerId - The unique customer identifier (UUID)
   * @returns Promise resolving to the KYC session with flow link
   * 
   * @example
   * ```typescript
   * const kycSession = await align.customers.createKycSession('123e4567-e89b-12d3-a456-426614174000');
   * console.log(kycSession.kycs.kyc_flow_link);
   * // "https://kyc.alignlabs.dev/flow/..."
   * 
   * // Redirect user to complete KYC
   * window.location.href = kycSession.kycs.kyc_flow_link;
   * ```
   */
  public async createKycSession(customerId: string): Promise<KycSessionResponse> {
    return this.client.post<KycSessionResponse>(CUSTOMER_ENDPOINTS.KYC(customerId));
  }
}
