/**
 * Response from uploading a file
 */
export interface UploadFileResponse {
  /** Unique identifier for the uploaded file */
  id: string;
  /** Original filename */
  name: string;
  /** Content type of the file */
  type: string;
}
