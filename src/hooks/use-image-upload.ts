import { useState, useCallback } from 'react'

export interface ImagenData {
  id: number
  nombre: string
  tipo: string
  data: string
  tamaño: number
  createdAt: string
}

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    if (!file) {
      throw new Error('No se proporcionó ningún archivo')
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen')
    }

    // Validar tamaño (máximo 5MB)
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      throw new Error(`La imagen no puede ser mayor a ${MAX_SIZE / (1024 * 1024)}MB`)
    }

    setIsUploading(true)
    setUploadProgress(0)
    setUploadError(null)

    try {
      // Convertir a base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result)
          } else {
            reject(new Error('Error al convertir imagen a base64'))
          }
        }
        reader.onerror = () => reject(new Error('Error al leer el archivo'))
        reader.readAsDataURL(file)
      })

      // Subir al backend
      const response = await fetch('/api/imagenes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: file.name,
          tipo: file.type,
          data: base64,
          tamaño: file.size
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al guardar la imagen')
      }

      const imagen = await response.json()
      setUploadProgress(100)
      // Devuelve la URL para insertar en el editor
      return `/api/imagenes/${imagen.id}`
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setUploadError(errorMessage)
      throw error
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }, [])

  const clearError = useCallback(() => {
    setUploadError(null)
  }, [])

  return {
    uploadImage,
    isUploading,
    uploadProgress,
    uploadError,
    clearError
  }
} 