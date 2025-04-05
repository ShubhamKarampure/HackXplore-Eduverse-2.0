"use client"

import type { editor } from "monaco-editor"
import { Button } from "@/components/ui/button"
import { Undo2, Redo2, Copy, Search, FileDown } from "lucide-react"

type ToolbarProps = {
  editor: editor.IStandaloneCodeEditor
}

export function Toolbar({ editor }: ToolbarProps) {

  const handleUndo = () => {
    editor.trigger("toolbar", "undo", null)
  }

  const handleRedo = () => {
    editor.trigger("toolbar", "redo", null)
  }

  const handleCopy = () => {
    const selection = editor.getSelection()
    if (selection && !selection.isEmpty()) {
      const text = editor.getModel()?.getValueInRange(selection)
      if (text) {
        navigator.clipboard.writeText(text).then(() => {
        })
      }
    } else {
      // Copy all text if no selection
      const text = editor.getValue()
      navigator.clipboard.writeText(text).then(() => {
      })
    }
  }

  const handleSearch = () => {
    editor.trigger("toolbar", "actions.find", null)
  }

  const handleDownload = () => {
    const text = editor.getValue()
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "code.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleUndo}>
        <Undo2 className="h-4 w-4" />
        <span className="sr-only">Undo</span>
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRedo}>
        <Redo2 className="h-4 w-4" />
        <span className="sr-only">Redo</span>
      </Button>
      <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
        <Copy className="h-4 w-4" />
        <span className="sr-only">Copy</span>
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSearch}>
        <Search className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownload}>
        <FileDown className="h-4 w-4" />
        <span className="sr-only">Download</span>
      </Button>
    </div>
  )
}

