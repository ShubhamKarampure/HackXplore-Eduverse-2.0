"use client";

import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-tiptap/styles.css";


export default function Layout({ children }) {
  return (
    <LiveblocksProvider publicApiKey={"pk_dev_YWTX7I4L4DSC4eex6MYdSDc1XhjmVWRlD0MOFKYfx7px7rTT0pY24OiyR7dIVvT4"}>
      <RoomProvider id="my-room">
        <ClientSideSuspense fallback={<div>Loading…</div>}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}