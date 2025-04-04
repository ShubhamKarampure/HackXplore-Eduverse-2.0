"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import CodeBlock from "@tiptap/extension-code-block";
import * as Y from "yjs";
import { getYjsProviderForRoom } from "@liveblocks/yjs";
import { useRoom, useSelf } from "@liveblocks/react/suspense";
import { Toolbar } from "./EnhancedToolbar";
import styles from "./CollaborativeEditor.module.css";
import { Avatars } from "./Avatars";
import { useCallback, useState, useEffect, useRef } from "react";
import { StatusBar } from "./StatusBar";
import { FileText } from "lucide-react";

type CollaborativeEditorProps = {
  documentName: string;
};

// Collaborative text editor with enhanced rich text features, live cursors, and avatars
export function CollaborativeTextEditor({ documentName }: CollaborativeEditorProps) {
  const room = useRoom();
  const [isConnected, setIsConnected] = useState(false);
  
  // Set up Liveblocks Yjs provider
  const provider = getYjsProviderForRoom(room);

  if (!provider) {
    return null;
  }

  // Monitor connection status
  provider.awareness.on('change', () => {
    setIsConnected(true);
  });

  return <TiptapEditor 
    doc={provider.getYDoc()} 
    provider={provider} 
    isConnected={isConnected}
    documentName={documentName}
  />;
}

type EditorProps = {
  doc: Y.Doc;
  provider: any;
  isConnected: boolean;
  documentName: string;
};

function TiptapEditor({ doc, provider, isConnected, documentName }: EditorProps) {
  // Get user info from Liveblocks authentication endpoint
  const userInfo = useSelf((me) => me.info);
  const [wordCount, setWordCount] = useState({ words: 0, characters: 0 });
  const editorContentRef = useRef<HTMLDivElement>(null);
  
  // Callback for word count updates
  const handleUpdate = useCallback(({ editor }) => {
    const text = editor.getText();
    setWordCount({
      words: text.split(/\s+/).filter(word => word !== '').length,
      characters: text.length
    });
    
    // Scroll to bottom when content exceeds viewport
    if (editorContentRef.current) {
      const scrollHeight = editorContentRef.current.scrollHeight;
      const clientHeight = editorContentRef.current.clientHeight;
      const scrollTop = editorContentRef.current.scrollTop;
      
      // If we're already near the bottom, auto-scroll down
      if (scrollTop + clientHeight > scrollHeight - 100) {
        setTimeout(() => {
          if (editorContentRef.current) {
            editorContentRef.current.scrollTop = editorContentRef.current.scrollHeight;
          }
        }, 0);
      }
    }
  }, []);

  // Set up editor with enhanced plugins
  const editor = useEditor({
    editorProps: {
      attributes: {
        class: styles.editor,
      },
    },
    extensions: [
      StarterKit.configure({
        history: false,
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      // Register the document with Tiptap
      Collaboration.configure({
        document: doc,
      }),
      // Attach provider and user info
      CollaborationCursor.configure({
        provider: provider,
        user: userInfo,
      }),
      // Additional extensions for enhanced functionality
      Placeholder.configure({
        placeholder: 'Start typing or use commands...',
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        validate: href => /^(https?:\/\/)/.test(href),
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight,
      CodeBlock.configure({
        languageClassPrefix: 'language-',
        HTMLAttributes: {
          class: styles.codeBlock,
        },
      }),
    ],
    onUpdate: handleUpdate,
  });

  // Set viewport height on load and resize
  useEffect(() => {
    const setViewportHeight = () => {
      if (editorContentRef.current) {
        // Calculate height (subtract the height of header and status bar)
        const viewportHeight = window.innerHeight;
        const editorContainer = editorContentRef.current;
        const containerRect = editorContainer.getBoundingClientRect();
        const offsetTop = containerRect.top;
        
        // Set minimum height
        const minHeight = Math.max(400, viewportHeight - offsetTop - 50); // 50px for status bar
        editorContainer.style.height = `${minHeight}px`;
      }
    };

    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    
    return () => {
      window.removeEventListener('resize', setViewportHeight);
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.documentHeader}>
        <div className={styles.documentTitle}>
          <FileText size={20} />
          <h1>{documentName}</h1>
        </div>
      </div>
      <div className={styles.editorHeader}>
        <Toolbar editor={editor} />
        <Avatars />
      </div>
      <EditorContent 
        editor={editor} 
        className={styles.editorContainer} 
        ref={editorContentRef}
      />
      <StatusBar 
        wordCount={wordCount} 
        isConnected={isConnected} 
        activeUsers={provider?.awareness?.getStates()?.size || 0}
      />
    </div>
  );
}