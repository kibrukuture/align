import { HttpClient } from '@/core/http-client';
import { AlignValidationError } from '@/core/errors';
import type { UploadFileResponse } from '@/resources/files/files.types';
import { UploadFileSchema } from '@/resources/files/files.validator';
import { FILE_ENDPOINTS } from '@/constants';

export class FilesResource {
  constructor(private client: HttpClient) {}

  /**
   * Upload a file for KYC verification or other purposes
   * 
   * Supports uploading documents such as government IDs, proof of address,
   * or other verification documents required for KYC.
   * 
   * @param file - The file to upload (File or Blob object)
   * @returns Promise resolving to the uploaded file details
   * @throws {AlignValidationError} If the input is not a valid File or Blob object
   * 
   * @remarks
   * - Requires FormData support (available in browser and Node.js environments)
   * - The Content-Type header is automatically set by the runtime
   * - Supported file types depend on AlignLab's requirements
   * 
   * @example
   * ```typescript
   * // In a browser environment
   * const fileInput = document.querySelector('input[type="file"]');
   * const file = fileInput.files[0];
   * 
   * const uploadedFile = await align.files.upload(file);
   * console.log(uploadedFile.id);   // "123e4567-e89b-12d3-a456-426614174000"
   * console.log(uploadedFile.name); // "document.pdf"
   * console.log(uploadedFile.type); // "application/pdf"
   * ```
   */
  public async upload(file: File | Blob): Promise<UploadFileResponse> {
    // Validate that the input is actually a File or Blob
    const validation = UploadFileSchema.safeParse(file);
    if (!validation.success) {
      throw new AlignValidationError(
        'Invalid file input',
        { file: ['Input must be a File or Blob object'] }
      );
    }

    const formData = new FormData();
    formData.append('file', file);

    return this.client.post<UploadFileResponse>(FILE_ENDPOINTS.UPLOAD, formData);
  }
}
