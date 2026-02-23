import { SUPABASE_URL } from '@/constants';

/**
 * Returns the image URL, handling both full URLs and storage paths.
 * Note: Supabase image transformation requires Pro plan.
 * Optimization is achieved through pre-upload compression and expo-image caching.
 *
 * @param urlOrPath - Full URL or storage path
 * @returns The image URL
 */
export const getImageUrl = (urlOrPath: string): string => {
  if (!urlOrPath) return '';

  // If it's already a full URL, return as-is
  if (urlOrPath.startsWith('http')) {
    return urlOrPath;
  }

  // If it's a storage path, construct the full URL
  return `${SUPABASE_URL}/storage/v1/object/public/images/${urlOrPath}`;
};
