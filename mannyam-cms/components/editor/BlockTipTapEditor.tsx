"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TipTapLink from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

function ToolbarButton({ active = false, children, onClick }: { active?: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-2 py-1 text-xs font-sans ${
        active ? "bg-olive text-paper" : "bg-ivory text-olive hover:bg-gold/30"
      }`}
    >
      {children}
    </button>
  );
}

export function BlockTipTapEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: false }),
      Image,
      TipTapLink.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Write rich text block content…" }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: "prose prose-olive max-w-none min-h-[150px] p-3 focus:outline-none font-sans text-sm",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync content if it changes externally (e.g. from history or rollback)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="overflow-hidden rounded-md border border-olive/10 bg-paper">
      <div className="flex flex-wrap gap-1.5 border-b border-olive/10 bg-cream/50 p-2">
        <ToolbarButton active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()}>
          Bold
        </ToolbarButton>
        <ToolbarButton active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()}>
          Italic
        </ToolbarButton>
        <ToolbarButton active={editor?.isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </ToolbarButton>
        <ToolbarButton active={editor?.isActive("heading", { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
        </ToolbarButton>
        <ToolbarButton onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          Bullet List
        </ToolbarButton>
        <ToolbarButton onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
          Ordered List
        </ToolbarButton>
        <ToolbarButton onClick={() => { const href = window.prompt("Link URL"); if (href) editor?.chain().focus().extendMarkRange("link").setLink({ href }).run(); }}>
          Link
        </ToolbarButton>
        <ToolbarButton onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
          Divider
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
