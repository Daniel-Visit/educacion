'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, Image, FileText } from 'lucide-react';
import { useFileUpload } from '@/hooks/use-file-upload';
import { STORAGE_BUCKETS } from '@/lib/supabase';

interface FileUploadProps {
  bucket?: keyof typeof STORAGE_BUCKETS;
  onFileUploaded?: (url: string, path: string) => void;
  onError?: (error: string) => void;
  maxFiles?: number;
  maxSize?: number; // en bytes
  accept?: Record<string, string[]>;
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  bucket = 'ARCHIVOS',
  onFileUploaded,
  onError,
  maxFiles = 1,
  maxSize = 50 * 1024 * 1024, // 50MB
  accept,
  className = '',
  disabled = false
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    url: string;
    path: string;
    name: string;
    size: number;
  }>>([]);

  const { uploadFile, isUploading, progress, error } = useFileUpload({
    bucket: STORAGE_BUCKETS[bucket],
    onSuccess: (url, path) => {
      onFileUploaded?.(url, path);
    },
    onError: (error) => {
      onError?.(error);
    }
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      for (const file of acceptedFiles) {
        const result = await uploadFile(file);
        setUploadedFiles(prev => [...prev, {
          url: result.url,
          path: result.path,
          name: file.name,
          size: file.size
        }]);
      }
    } catch (err) {
      console.error('Error uploading files:', err);
    }
  }, [uploadFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept,
    disabled: disabled || isUploading
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <Image className="w-4 h-4" />;
    }
    if (['pdf', 'doc', 'docx', 'txt'].includes(extension || '')) {
      return <FileText className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Área de drop */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        
        {isDragActive ? (
          <p className="text-blue-600 font-medium">Suelta los archivos aquí...</p>
        ) : (
          <div>
            <p className="text-gray-600 font-medium mb-2">
              Arrastra archivos aquí o haz clic para seleccionar
            </p>
            <p className="text-sm text-gray-500">
              Máximo {maxFiles} archivo{maxFiles > 1 ? 's' : ''} • 
              Tamaño máximo: {formatFileSize(maxSize)}
            </p>
          </div>
        )}
      </div>

      {/* Barra de progreso */}
      {isUploading && progress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subiendo archivo...</span>
            <span>{Math.round(progress.percentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Archivos subidos */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Archivos subidos:</h4>
          {uploadedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getFileIcon(file.name)}
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 