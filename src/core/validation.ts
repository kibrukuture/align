import { z } from 'zod/v4';

 
/**
 * Formats a ZodError into a simple Record<string, string[]> format
 * used by AlignValidationError.
 * 
 * Replaces the deprecated error.flatten().fieldErrors
 */
export function formatZodError(error: z.ZodError): Record<string, string[]> {
  // Use z.treeifyError as recommended by the deprecation warning
  const tree = z.treeifyError(error);
  const result: Record<string, string[]> = {};
  
  // The return type of treeifyError might vary based on version, but typically has properties/errors
  // We cast to any here to avoid strict type checks if the inferred type is too complex or union-based
  // but we check for existence of properties at runtime.
  // Actually, let's try to use the inferred type properties if possible.
  
  
  
  if (tree.errors) {
    for (const [key, value] of Object.entries(tree.errors)) {
      const node = value as { errors?: string[] };
      if (node.errors && node.errors.length > 0) {
        result[key] = node.errors;
      }
    }
  }
  
  // Also handle top-level errors if any (though typically we want field errors)
  if (tree.errors && Array.isArray(tree.errors) && tree.errors.length > 0) {
    result['_root'] = tree.errors;
  }
  
  return result;
}
