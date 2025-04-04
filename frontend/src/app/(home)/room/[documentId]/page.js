"use client";
import React from "react";
import { useParams, useSearchParams } from "next/navigation";
import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/react";
import useUserStore from "@/store/userStore";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
import { CollaborativeEditor } from "@/components/collab/text-editor/CollaborativeEditor";

function RoomLoadingIndicator() {
  return <div>Loading Collaborative Session...</div>;
}

export default function DocumentPage() {
  const params = useParams();
  const documentId = params?.documentId;
  const searchParams = useSearchParams();
  const documentType = searchParams.get("type") || "text";
  const documentName = searchParams.get("name") || "Untitled";
  
  // Get user token at component level, not in async function
  const userToken = useUserStore(state => state.token);
  const username = useUserStore(state => state?.user?.username || "Anonymous");
  
  // Auth function that uses the token from above
  const getAuth = React.useCallback(async (room) => {
    if (!userToken) {
      console.error("User token not found");
      return null;
    }
    
    try {
      const response = await fetch(`${BACKEND_URL}/liveblocks/auth`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ room }),
      });
      console.log(response)
      if (!response.ok) {
        throw new Error(`Auth failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Auth API call failed:", error);
      return null;
    }
  }, [userToken]);

  if (!documentId || !documentType) {
    return <div>Invalid Document ID or Type.</div>;
  }

  return (
    <LiveblocksProvider authEndpoint={async (room) => getAuth(room)}>
      <RoomProvider
        id={documentId}
        initialPresence={{
          username,
          cursor: null,
        }}
      >
        <ClientSideSuspense fallback={<RoomLoadingIndicator />}>
  {() => (
    documentType === "code" ? (
      <></>
    ) : (
      <CollaborativeEditor/>
    )
  )}
   </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}