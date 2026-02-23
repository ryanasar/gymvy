import { decode } from 'base64-arraybuffer';
import { supabase } from '@/lib/supabase';
import { checkNetworkStatus } from '@/services/network/networkService';

const UPLOAD_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 2;

/**
 * Upload an image to Supabase Storage
 * @param {string} uri - Local file URI from ImagePicker
 * @param {string} folder - Folder path within the bucket (e.g., 'posts')
 * @returns {Promise<{url: string, path: string}>} - Public URL and storage path
 */
export const uploadImage = async (uri, folder = 'posts') => {
  // Check network connectivity first
  const isConnected = await checkNetworkStatus();
  if (!isConnected) {
    throw new Error('No internet connection. Please check your network and try again.');
  }

  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT);

    try {
      // Fetch the file with timeout
      const response = await fetch(uri, { signal: controller.signal });
      const blob = await response.blob();

      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const base64String = reader.result.split(',')[1]; // Remove data:image/xxx;base64, prefix
          resolve(base64String);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(blob);
      const base64 = await base64Promise;

      // Generate a unique filename
      const fileExt = uri.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Convert base64 to ArrayBuffer
      const arrayBuffer = decode(base64);

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('images')
        .upload(filePath, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: false,
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      clearTimeout(timeoutId);
      return {
        url: publicUrl,
        path: filePath,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;

      if (error.name === 'AbortError') {
        lastError = new Error('Upload timed out. Please try again.');
      }

      console.error(`Upload attempt ${attempt + 1} failed:`, error);

      // Only retry if we have attempts left
      if (attempt < MAX_RETRIES) {
        // Exponential backoff: 1s, 2s
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
    }
  }

  console.error('Error uploading image after all retries:', lastError);
  throw lastError;
};

/**
 * Delete an image from Supabase Storage
 * @param {string} path - Storage path of the file
 * @returns {Promise<void>}
 */
export const deleteImage = async (path) => {
  try {
    const { error } = await supabase.storage
      .from('images')
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

export default function StorageApiPage() {
  return null;
}
