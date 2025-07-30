import { useState } from 'react';
import { storageUtils, STORAGE_BUCKETS, StorageBucket } from '@/lib/supabase';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UseFileUploadOptions {
  bucket?: StorageBucket;
  onProgress?: (progress: UploadProgress) => void;
  onSuccess?: (url: string, path: string) => void;
  onError?: (error: string) => void;
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (
    file: File,
    customPath?: string,
    customBucket?: StorageBucket
  ) => {
    setIsUploading(true);
    setError(null);
    setProgress(null);

    try {
      const bucket = customBucket || options.bucket || STORAGE_BUCKETS.ARCHIVOS;
      
      // Generar path único si no se proporciona
      const path = customPath || `${Date.now()}-${file.name}`;
      
      // Simular progreso (Supabase no tiene progreso nativo)
      const simulateProgress = () => {
        let currentProgress = 0;
        const interval = setInterval(() => {
          currentProgress += Math.random() * 20;
          if (currentProgress >= 90) {
            clearInterval(interval);
            return;
          }
          
          const progressData = {
            loaded: (currentProgress / 100) * file.size,
            total: file.size,
            percentage: currentProgress
          };
          
          setProgress(progressData);
          options.onProgress?.(progressData);
        }, 100);
        
        return interval;
      };

      const progressInterval = simulateProgress();

      // Subir archivo
      const result = await storageUtils.uploadFile(bucket, path, file, {
        upsert: true
      });

      clearInterval(progressInterval);

      // Marcar como completado
      const finalProgress = {
        loaded: file.size,
        total: file.size,
        percentage: 100
      };
      
      setProgress(finalProgress);
      options.onProgress?.(finalProgress);

      // Obtener URL
      const url = storageUtils.getPublicUrl(bucket, path);
      
      options.onSuccess?.(url, path);
      
      return { url, path, bucket };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      options.onError?.(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadImage = async (
    file: File,
    customPath?: string
  ) => {
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen');
    }
    
    return uploadFile(file, customPath, STORAGE_BUCKETS.IMAGENES);
  };

  const uploadDocument = async (
    file: File,
    customPath?: string
  ) => {
    // Validar tipos de documento permitidos
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de documento no permitido');
    }
    
    return uploadFile(file, customPath, STORAGE_BUCKETS.DOCUMENTOS);
  };

  const uploadAvatar = async (
    file: File,
    userId: string
  ) => {
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen');
    }
    
    // Generar path con userId
    const extension = file.name.split('.').pop();
    const path = `avatars/${userId}.${extension}`;
    
    return uploadFile(file, path, STORAGE_BUCKETS.AVATARES);
  };

  return {
    uploadFile,
    uploadImage,
    uploadDocument,
    uploadAvatar,
    isUploading,
    progress,
    error,
    resetError: () => setError(null)
  };
} 