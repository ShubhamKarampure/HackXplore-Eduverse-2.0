"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelf } from "@liveblocks/react/suspense";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";


export function Cursors({ yProvider }) {
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
  }, [yProvider]);

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
