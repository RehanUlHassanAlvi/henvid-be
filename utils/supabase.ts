import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Image upload service
export class SupabaseImageService {
  
  /**
   * Upload an image to Supabase Storage
   * @param file - The image file to upload
   * @param folder - The folder path (e.g., 'users', 'companies', 'avatars')
   * @param fileName - Optional custom filename (will generate one if not provided)
   * @returns Promise with the download URL
   */
  static async uploadImage(
    file: File, 
    folder: string = 'images', 
    fileName?: string
  ): Promise<string> {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 5MB');
      }

      // Generate filename if not provided
      const timestamp = Date.now();
      const cleanFileName = fileName || `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      // Create file path
      const filePath = `${folder}/${cleanFileName}`;
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('images') // Storage bucket name
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Allow overwriting files
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  /**
   * Delete an image from Supabase Storage
   * @param imageUrl - The full download URL of the image
   * @returns Promise<void>
   */
  static async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const folderIndex = urlParts.findIndex(part => part === 'images');
      
      if (folderIndex === -1) {
        throw new Error('Invalid image URL format');
      }
      
      const filePath = urlParts.slice(folderIndex + 1).join('/');
      
      const { error } = await supabase.storage
        .from('images')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting image:', error);
        // Don't throw error for delete operations as it might be already deleted
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      // Don't throw error for delete operations as it might be already deleted
    }
  }

  /**
   * Upload avatar image with optimized settings
   * @param file - The avatar image file
   * @param userId - User ID for the filename
   * @returns Promise with the download URL
   */
  static async uploadAvatar(file: File, userId: string): Promise<string> {
    return this.uploadImage(file, 'avatars', `avatar_${userId}_${Date.now()}`);
  }

  /**
   * Upload company logo with optimized settings
   * @param file - The logo image file
   * @param companyId - Company ID for the filename
   * @returns Promise with the download URL
   */
  static async uploadCompanyLogo(file: File, companyId: string): Promise<string> {
    return this.uploadImage(file, 'company-logos', `logo_${companyId}_${Date.now()}`);
  }

  /**
   * Get file info from URL
   * @param url - Supabase storage URL
   * @returns Object with file info
   */
  static getFileInfoFromUrl(url: string) {
    try {
      const urlParts = url.split('/');
      const fileWithParams = urlParts[urlParts.length - 1];
      const fileName = fileWithParams.split('?')[0];
      const folderIndex = urlParts.findIndex(part => part === 'images');
      const folder = folderIndex > -1 ? urlParts[folderIndex + 1] : 'unknown';
      
      return { fileName, folder };
    } catch (error) {
      return { fileName: 'unknown', folder: 'unknown' };
    }
  }
}

export default SupabaseImageService; 