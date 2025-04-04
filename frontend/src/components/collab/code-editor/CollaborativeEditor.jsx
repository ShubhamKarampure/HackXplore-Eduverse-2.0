"use client";

import { getYjsProviderForRoom } from "@liveblocks/yjs";
import { useRoom } from "@liveblocks/react/suspense";
import { useCallback, useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import styles from "./CollaborativeEditor.module.css";
import { Avatars } from "./Avatars";
import { Cursors } from "./Cursors";
import { Toolbar } from "./Toolbar";
import { Card } from "@/components/ui/card";
// Dynamically import the Monaco editor with no SSR
const Editor = dynamic(
  () => import('@monaco-editor/react'),
  { ssr: false }
);

/**
 * Collaborative code editor component with real-time collaboration features
 * 
 * @param {Object} props
 * @param {string} props.documentId - Unique identifier for the document
 * @param {string} props.documentName - Display name of the document
 */
const CollaborativeEditor = ({ documentId, documentName }) => {
  const room = useRoom();
  const provider = getYjsProviderForRoom(room);
  const [editorRef, setEditorRef] = useState(null);
  const [binding, setBinding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up Liveblocks Yjs provider and attach Monaco editor
  useEffect(() => {
    if (typeof window === "undefined" || !editorRef) return;

    const setupEditor = async () => {
      try {
        setLoading(true);
        const yDoc = provider.getYDoc();
        const yText = yDoc.getText("monaco");
        
        // Import dependencies dynamically
        const { MonacoBinding } = await import('y-monaco');
        const { Awareness } = await import('y-protocols/awareness');
        
        // Attach Yjs to Monaco
        const newBinding = new MonacoBinding(
          yText,
          editorRef.getModel(),
          new Set([editorRef]),
          provider.awareness
        );
        
        setBinding(newBinding);
        setLoading(false);
      } catch (err) {
        console.error("Failed to initialize editor:", err);
        setError("Failed to initialize collaborative features");
        setLoading(false);
      }
    };

    setupEditor();

    return () => {
      if (binding) {
        binding.destroy();
      }
    };
  }, [editorRef, provider, room]);

  const handleOnMount = useCallback((editor) => {
    setEditorRef(editor);
  }, []);

  // Handle editor configuration options
  const editorOptions = {
    tabSize: 2,
    padding: { top: 20 },
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    lineNumbers: "on",
    fontFamily: "'SF Mono', Monaco, 'Cascadia Mono', 'Segoe UI Mono', monospace",
    fontSize: 14,
    wordWrap: "on",
    contextmenu: true,
    smoothScrolling: true,
  };

  return (
     <div className="pageWrapper">
    <div className={styles.container}>
      {provider && <Cursors yProvider={provider} />}
      
      <div className={styles.editorHeader}>
        <div className={styles.documentInfo}>
          <h2 className={styles.documentName}>{documentName}</h2>
          <span className={styles.documentId}>ID: {documentId}</span>
        </div>
        
        <div className={styles.collaborators}>
        
        </div>
        
        <div className={styles.toolbarContainer}>
          {editorRef && <Toolbar editor={editorRef} />}
        </div>
      </div>
      
      <div className={styles.editorContainer}>
        {loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner}></div>
            <p>Initializing collaborative editor...</p>
          </div>
        )}
        
        {error && (
          <div className={styles.errorOverlay}>
            <p>{error}</p>
            <button 
              className={styles.retryButton}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        )}
        
        <Editor
          onMount={handleOnMount}
          height="100%"
          width="100%"
          theme="vs-dark"
          defaultLanguage="typescript"
          defaultValue=""
          options={editorOptions}
          loading={<div className={styles.editorLoading}>Loading editor...</div>}
        />
      </div>
      </div>
      </div>
  );
};

export default CollaborativeEditor;