"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelf, ClientSideSuspense } from "@liveblocks/react/suspense";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";

// Create an inner component that uses the Liveblocks hooks
function CursorsContent({ yProvider }) {
  // Get user info from Liveblocks authentication endpoint
  const userInfo = useSelf((me) => me.info);
  
  const [awarenessUsers, setAwarenessUsers] = useState([]);
  
  useEffect(() => {
    // Add user info to Yjs awareness
    const localUser = userInfo;
    yProvider.awareness.setLocalStateField("user", localUser);
    
    // On changes, update `awarenessUsers`
    function setUsers() {
      setAwarenessUsers([...yProvider.awareness.getStates()]);
    }
    
    yProvider.awareness.on("change", setUsers);
    setUsers();
    
    return () => {
      yProvider.awareness.off("change", setUsers);
    };
  }, [yProvider, userInfo]);
  
  // Insert awareness info into cursors with styles
  const styleSheet = useMemo(() => {
    let cursorStyles = "";
    
    for (const [clientId, client] of awarenessUsers) {
      if (client?.user) {
        cursorStyles += `
          .yRemoteSelection-${clientId}, 
          .yRemoteSelectionHead-${clientId}  {
            --user-color: ${client.user.color || "orangered"};
          }
          
          .yRemoteSelectionHead-${clientId}::after {
            content: "${client.user.name}";
          }
        `;
      }
    }
    
    return { __html: cursorStyles };
  }, [awarenessUsers]);
  
  return <style dangerouslySetInnerHTML={styleSheet} />;
}

// Wrapper component that uses ClientSideSuspense
export function Cursors({ yProvider }) {
  return (
    <ClientSideSuspense fallback={<div>Loading...</div>}>
      {() => <CursorsContent yProvider={yProvider} />}
    </ClientSideSuspense>
  );
}