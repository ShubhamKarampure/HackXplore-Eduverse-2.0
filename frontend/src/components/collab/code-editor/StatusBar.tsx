import { Code, Users } from "lucide-react"
import { cn } from "@/lib/utils"

type StatusBarProps = {
  codeStats: {
    lines: number
    characters: number
  }
  isConnected: boolean
  activeUsers: number
  language?: string
}

export function StatusBar({ codeStats, isConnected, activeUsers, language }: StatusBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-1 text-xs border-t bg-slate-50 dark:bg-slate-900">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-green-500" : "bg-red-500")} />
          <span>{isConnected ? "Connected" : "Disconnected"}</span>
        </div>

        <div className="flex items-center gap-1">
          <Users size={12} />
          <span>{activeUsers} active</span>
        </div>

        {language && (
          <div className="flex items-center gap-1">
            <Code size={12} />
            <span>{language}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <span>Lines: {codeStats.lines}</span>
        <span>Characters: {codeStats.characters}</span>
      </div>
    </div>
  )
}

