"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

type OutputPanelProps = {
  output: {
    content: string
    type: "success" | "error" | "info"
  }
}

export function OutputPanel({ output }: OutputPanelProps) {
  const outputRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output])

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              output.type === "success" ? "bg-green-500" : output.type === "error" ? "bg-red-500" : "bg-blue-500",
            )}
          />
          <span className="text-sm font-medium">
            {output.type === "success" ? "Success" : output.type === "error" ? "Error" : "Info"}
          </span>
        </div>
        <button
          className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          onClick={() => {
            if (outputRef.current) {
              outputRef.current.scrollTop = outputRef.current.scrollHeight
            }
          }}
        >
          Scroll to Bottom
        </button>
      </div>
      <div
        ref={outputRef}
        className="flex-1 p-4 overflow-auto font-mono text-sm whitespace-pre-wrap bg-slate-50 dark:bg-slate-900"
      >
        {output.content}
      </div>
    </div>
  )
}

