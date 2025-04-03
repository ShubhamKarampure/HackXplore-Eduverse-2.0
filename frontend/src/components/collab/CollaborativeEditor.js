// components/CollaborativeEditor.js
import React, { useMemo } from 'react';
import { RoomProvider } from "@liveblocks/react";
import EditorUI from './EditorUI'; // Adjust path
import PresenceDisplay from './PresenceDisplay'; // Adjust path

export default function CollaborativeEditor({ roomId }) {
    // Initial storage for Yjs provider (often empty or structured if needed)
    const initialStorage = useMemo(() => ({}), []);
    // Initial presence (cursor handled by TipTap extension)
    const initialPresence = useMemo(() => ({ cursor: null }), []);

    return (
        <RoomProvider
            id={roomId}
            initialPresence={initialPresence}
            initialStorage={initialStorage}
        >
            <div className="editor-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative' }}>
                <header style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 5 }}>
                    {/* Consider fetching and displaying actual document name here */}
                    <span>Document: {roomId.substring(0, 8)}...</span> {/* Display partial ID */}
                    <PresenceDisplay />
                </header>
                <EditorUI roomId={roomId} />
                {/* LiveCursors component removed - handled by TipTap extension */}
            </div>
        </RoomProvider>
    );
}