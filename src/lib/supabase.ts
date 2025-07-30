import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para Storage
export interface StorageFile {
  name: string;
  bucket: string;
  path: string;
  size: number;
  mimeType: string;
  url?: string;
}

// Funciones de utilidad para Storage
export const storageUtils = {
  // Subir archivo
  async uploadFile(
    bucket: string,
    path: string,
    file: File,
    options?: {
      cacheControl?: string;
      upsert?: boolean;
    }
  ) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, options);

    if (error) {
      throw new Error(`Error uploading file: ${error.message}`);
    }

    return data;
  },

  // Obtener URL pública
  getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  },

  // Obtener URL firmada (para archivos privados)
  async getSignedUrl(bucket: string, path: string, expiresIn: number = 3600) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw new Error(`Error getting signed URL: ${error.message}`);
    }

    return data.signedUrl;
  },

  // Eliminar archivo
  async deleteFile(bucket: string, path: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw new Error(`Error deleting file: ${error.message}`);
    }
  },

  // Listar archivos en bucket
  async listFiles(bucket: string, path?: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path);

    if (error) {
      throw new Error(`Error listing files: ${error.message}`);
    }

    return data;
  }
};

// Buckets disponibles
export const STORAGE_BUCKETS = {
  IMAGENES: 'imagenes',
  ARCHIVOS: 'archivos',
  AVATARES: 'avatares',
  DOCUMENTOS: 'documentos'
} as const;

export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS]; 