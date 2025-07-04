"use client"

import * as React from "react"
import { useCallback, useRef } from "react"
import { ImagePlusIcon } from "@/components/tiptap-icons/image-plus-icon"
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Editor } from "@tiptap/react"

interface ImageUploadButtonProps {
  editor: Editor | null
  text?: string
}

export default function ImageUploadButton({ editor, text = "Add" }: ImageUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file || !editor) return

      // Solo insertar imagen base64 localmente
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Insertar imagen base64 en el editor
          editor.chain().focus().setImage({ src: reader.result }).run()
        }
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
      reader.onerror = () => {
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
      reader.readAsDataURL(file)
    },
    [editor]
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
        title="Upload image (max 5MB)"
      >
        <ImagePlusIcon className="tiptap-button-icon" />
        {text}
      </Button>
    </>
  )
}
