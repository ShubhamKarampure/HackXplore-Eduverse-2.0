import { useEffect, useState } from "react";
import type { LiveblocksYjsProvider } from "@liveblocks/yjs";
import type { Awareness } from "y-protocols/awareness";

type CursorsProps = {
  yProvider: LiveblocksYjsProvider;
}

type CursorState = {
  id: number;
  name: string;
  color: string;
  position: {
    top: number;
    left: number;
  };
}

export function Cursors({ yProvider }: CursorsProps) {
  const [cursors, setCursors] = useState<CursorState[]>([]);

  useEffect(() => {
    const awareness = yProvider.awareness as unknown as Awareness;
    
    const updateCursors = () => {
      const states = Array.from(awareness.getStates().entries());
      const newCursors: CursorState[] = [];
      
      for (const [clientId, state] of states) {
        // Check if this is not our cursor and if it has cursor position info
        if (clientId !== awareness.clientID && state.cursor && state.user) {
          newCursors.push({
            id: clientId,
            name: state.user?.name || `User ${clientId}`,
            color: state.user?.color || "#000000",
            position: state.cursor,
          });
        }
      }
      
      setCursors(newCursors);
    };
    
    // Listen for awareness changes
    awareness.on("change", updateCursors);
    
    return () => {
      awareness.off("change", updateCursors);
    };
  }, [yProvider]);

  return (
    <>
      {cursors.map((cursor) => (
        <div
          key={cursor.id}
          className="absolute pointer-events-none select-none z-10"
          style={{
            transform: `translate(${cursor.position.left}px, ${cursor.position.top}px)`,
            top: 0,
            left: 0,
          }}
        >
          <div 
            className="absolute w-0.5 h-[18px] z-10" 
            style={{ backgroundColor: cursor.color }} 
          />
          <div
            className="absolute -top-[18px] left-0 text-xs px-1 whitespace-nowrap rounded z-10 text-white"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.name}
          </div>
        </div>
      ))}
    </>
  );
}