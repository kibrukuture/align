import { HttpClient } from '@/core/http-client';
import { FILE_ENDPOINTS } from '@/constants';

export interface UploadFileResponse {
  id: string;
  url: string;
  created_at: string;
}

export class FilesResource {
  constructor(private client: HttpClient) {}

  /**
   * Upload a file (e.g. for KYC)
   * Note: This requires a FormData object which is available in browser/Node environments
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
