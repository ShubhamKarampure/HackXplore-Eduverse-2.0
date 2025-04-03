// app/room/layout.js
'use client'; 
import React from 'react';
import { LiveblocksProvider, ClientSideSuspense } from "@liveblocks/react";

function RoomLoadingIndicator() {
  return <div style={{ padding: '20px' }}>Loading Collaborative Session...</div>;
}

export default function RoomLayout({ children }) {
  const publicKey = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;

  if (!publicKey) {
      console.error("Liveblocks Error: NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY is not defined.");
      return (
          <div>
              <p style={{color: 'red', padding: '20px'}}>Configuration Error: Cannot load collaboration features.</p>
              {children} 
          </div>
      );
  }

  return (
    <LiveblocksProvider
      publicApiKey={publicKey} 
    >
      <ClientSideSuspense fallback={<RoomLoadingIndicator />}>
        {() => children} 
      </ClientSideSuspense>
    </LiveblocksProvider>
  );
}