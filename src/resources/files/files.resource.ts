import { HttpClient } from '@/core/http-client';
import type { UploadFileResponse } from '@/resources/files/files.types';
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
    const formData = new FormData();
    formData.append('file', file);

    // We need to let the browser/runtime set the Content-Type header for FormData
    // so we pass a custom request function or handle it in HttpClient
    // For now, assuming HttpClient handles FormData correctly if body is FormData
    return this.client.post<UploadFileResponse>(FILE_ENDPOINTS.UPLOAD, formData);
  }
}
