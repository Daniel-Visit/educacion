"use client"

import * as React from "react"
import { useCallback, useRef } from "react"
import { ImagePlusIcon } from "@/components/tiptap-icons/image-plus-icon"
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Editor } from "@tiptap/react"
import { useImageUpload } from "@/hooks/use-image-upload"

interface ImageUploadButtonProps {
  editor: Editor | null
  text?: string
}

export default function ImageUploadButton({ editor, text = "Upload" }: ImageUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadImage, isUploading, uploadProgress, uploadError } = useImageUpload()

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file || !editor) return

      try {
        const url = await uploadImage(file)

        editor
          .chain()
          .focus()
          .setImage({ src: url })
          .run()
      } catch (error) {
        console.error("Error uploading image:", error)
        // El error ya se maneja en el hook
      } finally {
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    },
    [editor, uploadImage]
  )

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  if (!editor) return null

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
      <Button
        data-style="ghost"
        onClick={handleClick}
        disabled={isUploading}
        title="Upload image (max 5MB)"
      >
        <ImagePlusIcon className="tiptap-button-icon" />
        {text}
        {isUploading && (
          <div className="ml-2 text-xs text-gray-500">
            {uploadProgress}%
          </div>
        )}
      </Button>
      {uploadError && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-red-100 text-red-700 text-xs rounded border border-red-200 max-w-xs z-50">
          {uploadError}
        </div>
      )}
    </>
  )
}
