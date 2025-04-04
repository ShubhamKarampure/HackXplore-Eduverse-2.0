"use client";

import { Editor } from "@tiptap/react";
import styles from "./EnhancedToolbar.module.css";
import { 
  Bold, Italic, Underline, Strikethrough, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Heading1, Heading2, Code, 
  Table, Image, Link, Highlighter, Undo, Redo
} from "lucide-react";

type ToolbarProps = {
  editor: Editor | null;
};

export function Toolbar({ editor }: ToolbarProps) {
  if (!editor) {
    return null;
  }

  // Handle image insertion
  const addImage = () => {
    const url = window.prompt("Enter image URL");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  // Handle link insertion
  const setLink = () => {
    const url = window.prompt("Enter URL");
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  // Handle table insertion
  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run();
  };

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarGroup}>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? styles.isActive : ""}
          title="Bold"
        >
          <Bold size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? styles.isActive : ""}
          title="Italic"
        >
          <Italic size={18} />
        </button>
        <button
         
          className={editor.isActive("underline") ? styles.isActive : ""}
          title="Underline"
        >
          <Underline size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? styles.isActive : ""}
          title="Strikethrough"
        >
          <Strikethrough size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={editor.isActive("highlight") ? styles.isActive : ""}
          title="Highlight"
        >
          <Highlighter size={18} />
        </button>
      </div>

      <div className={styles.divider} />

      <div className={styles.toolbarGroup}>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive("heading", { level: 1 }) ? styles.isActive : ""}
          title="Heading 1"
        >
          <Heading1 size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive("heading", { level: 2 }) ? styles.isActive : ""}
          title="Heading 2"
        >
          <Heading2 size={18} />
        </button>
      </div>

      <div className={styles.divider} />

      <div className={styles.toolbarGroup}>
        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={editor.isActive({ textAlign: "left" }) ? styles.isActive : ""}
          title="Align left"
        >
          <AlignLeft size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={editor.isActive({ textAlign: "center" }) ? styles.isActive : ""}
          title="Align center"
        >
          <AlignCenter size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={editor.isActive({ textAlign: "right" }) ? styles.isActive : ""}
          title="Align right"
        >
          <AlignRight size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={editor.isActive({ textAlign: "justify" }) ? styles.isActive : ""}
          title="Justify"
        >
          <AlignJustify size={18} />
        </button>
      </div>

      <div className={styles.divider} />

      <div className={styles.toolbarGroup}>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? styles.isActive : ""}
          title="Bullet list"
        >
          <List size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? styles.isActive : ""}
          title="Ordered list"
        >
          <ListOrdered size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive("codeBlock") ? styles.isActive : ""}
          title="Code block"
        >
          <Code size={18} />
        </button>
      </div>

      <div className={styles.divider} />

      <div className={styles.toolbarGroup}>
        <button onClick={insertTable} title="Insert table">
          <Table size={18} />
        </button>
        <button onClick={addImage} title="Insert image">
          <Image size={18} />
        </button>
        <button
          onClick={setLink}
          className={editor.isActive("link") ? styles.isActive : ""}
          title="Insert link"
        >
          <Link size={18} />
        </button>
      </div>

      <div className={styles.divider} />

      <div className={styles.toolbarGroup}>
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo size={18} />
        </button>
      </div>
    </div>
  );
}