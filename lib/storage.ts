import { supabase } from './supabase';
import { Platform } from 'react-native';
import { decode } from 'base64-arraybuffer';

export type UploadResult = {
  url: string;
  path: string;
};

export async function uploadImage(
  uri: string,
  bucket: string,
  folder: string = ''
): Promise<UploadResult> {
  try {
    const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    let fileData: ArrayBuffer | Blob;
    
    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      fileData = await response.blob();
    } else {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      
      fileData = decode(base64Data);
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileData, {
        contentType: `image/${fileExt}`,
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    console.log('Image uploaded successfully:', publicUrlData.publicUrl);
    
    return {
      url: publicUrlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export async function deleteImage(bucket: string, path: string): Promise<void> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    
    if (error) {
      console.error('Delete error:', error);
      throw error;
    }
    
    console.log('Image deleted successfully:', path);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  BOOK_COVERS: 'book-covers',
} as const;
