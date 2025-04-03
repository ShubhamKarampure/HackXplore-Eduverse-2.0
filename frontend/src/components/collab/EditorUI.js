'use client';

import React, { useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
// Import Liveblocks hook and UI components
import {
    useLiveblocksExtension,
    FloatingComposer,
    Toolbar,
    FloatingToolbar,
} from "@liveblocks/react-tiptap";
import ShareFeature from './ShareFeature'; // Adjust path if needed

export default function EditorUI({ roomId }) {
    // Setup Liveblocks extension
    const liveblocks = useLiveblocksExtension();

    // Setup TipTap editor with useMemo to prevent recreation on each render
    const editor = useEditor({
        // Editor extensions
        extensions: [
            StarterKit.configure({
                history: false, // Liveblocks handles history
            }),
            liveblocks, // Add Liveblocks collaboration features
        ],
        // Editor styling properties
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none focus:outline-none p-4',
            },
        },
    });

    // Loading state until editor is ready
    if (!editor) {
        return <div className="flex justify-center items-center h-screen">Initializing editor...</div>;
    }

    // --- Rendering JSX ---
    return (
        // Main container: Full height, flex column layout
        <div className="min-h-screen flex flex-col relative bg-background text-foreground">

            {/* Top Bar: Fixed height, border, background, flex row for items */}
            <div className="h-[60px] flex items-center justify-between px-4 border-b border-border/80 bg-background shadow-sm z-10">
                {/* Toolbar on the left/center */}
                <Toolbar editor={editor} />

                {/* Share Feature on the right */}
                <ShareFeature documentId={roomId} />
            </div>

            {/* Editor Area: Takes remaining height, allows scrolling, relative for floating elements */}
            <div className="flex-grow flex flex-col relative overflow-hidden pt-4">

                {/* Editor Content Wrapper: Takes available space, enables scrolling */}
                <div className="flex-grow overflow-y-auto px-4 pb-4">
                    {/* Render the actual Tiptap editor content area */}
                    {/* The editorProps class handles the internal styling */}
                    <EditorContent editor={editor} className="h-full" />
                </div>

                {/* Liveblocks Floating UI Elements */}
                {/* These are positioned automatically relative to the editor/selection */}
                <FloatingToolbar editor={editor} />
                <FloatingComposer editor={editor} className="w-[350px]" />

            </div>
        </div>
    );
}