"use client"

import { useEffect, useState } from "react"
import type { YjsProvider } from "@liveblocks/yjs"
import type { Awareness } from "y-protocols/awareness"
import styles from "./CollaborativeEditor.module.css"

type CursorsProps = {
  yProvider: YjsProvider
}

type CursorState = {
  id: number
  name: string
  color: string
  position: {
    top: number
    left: number
  }
}

export function Cursors({ yProvider }: CursorsProps) {
  const [cursors, setCursors] = useState<CursorState[]>([])

  useEffect(() => {
    const awareness = yProvider.awareness as unknown as Awareness

    const updateCursors = () => {
      const states = Array.from(awareness.getStates().entries())
      const newCursors: CursorState[] = []

      for (const [clientId, state] of states) {
        if (clientId !== awareness.clientID && state.cursor) {
          newCursors.push({
            id: clientId,
            name: state.user?.name || `User ${clientId}`,
            color: state.user?.color || "#000000",
            position: state.cursor,
          })
        }
      }

      setCursors(newCursors)
    }

    awareness.on("change", updateCursors)

    return () => {
      awareness.off("change", updateCursors)
    }
  }, [yProvider])

  return (
    <>
      {cursors.map((cursor) => (
        <div
          key={cursor.id}
          className={styles.cursor}
          style={{
            transform: `translate(${cursor.position.left}px, ${cursor.position.top}px)`,
          }}
        >
          <div className={styles["cursor-caret"]} style={{ backgroundColor: cursor.color }} />
          <div className={styles["cursor-label"]} style={{ backgroundColor: cursor.color }}>
            {cursor.name}
          </div>
        </div>
      ))}
    </>
  )
}

