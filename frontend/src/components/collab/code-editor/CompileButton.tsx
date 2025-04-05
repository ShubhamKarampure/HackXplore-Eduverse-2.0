"use client"

import { Loader2, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type CompileButtonProps = {
  onCompile: () => void
  isCompiling: boolean
  isCompilable: boolean
}

export function CompileButton({ onCompile, isCompiling, isCompilable }: CompileButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={onCompile} disabled={isCompiling || !isCompilable} size="sm" className="gap-1">
            {isCompiling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {isCompiling ? "Compiling..." : "Run"}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {!isCompilable
            ? "This language doesn't support compilation in the browser"
            : isCompiling
              ? "Compiling your code..."
              : "Compile and run your code"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

