'use client';

import * as React from 'react';
import { Button } from '@/components/tiptap-ui-primitive/button';
import { MinusIcon } from '@/components/tiptap-icons/minus-icon';
import { useCurrentEditor } from '@tiptap/react';

interface HorizontalRuleButtonProps {
  className?: string;
}

export function HorizontalRuleButton({ className }: HorizontalRuleButtonProps) {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <Button
      disabled={!editor.can().setHorizontalRule()}
      data-state={editor.isActive('horizontalRule') ? 'active' : 'inactive'}
      onClick={() => editor.chain().focus().setHorizontalRule().run()}
      className={className}
      tooltip="Horizontal Rule"
    >
      <MinusIcon className="tiptap-button-icon" />
    </Button>
  );
}
