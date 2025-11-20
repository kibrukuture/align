import { z } from 'zod';

/**
 * Validator for file upload
 * Ensures the input is a valid File or Blob object
 */
export const UploadFileSchema = z.custom<File | Blob>(
  (data) => {
    // Check if it's a Blob (File extends Blob)
    if (typeof Blob !== 'undefined' && data instanceof Blob) {
      return true;
    }
    // Check if it's a File
    if (typeof File !== 'undefined' && data instanceof File) {
      return true;
    }
    return false;
  },
  {
    message: 'Input must be a File or Blob object',
  }
);
