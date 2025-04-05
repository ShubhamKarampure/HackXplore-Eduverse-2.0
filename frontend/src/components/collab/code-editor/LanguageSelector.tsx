"use client"

import { useState } from "react"
import { Check, ChevronDown, Code } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type LanguageSelectorProps = {
  currentLanguage: string
  onLanguageChange: (language: string) => void
}

const LANGUAGES = [
  { id: "typescript", name: "TypeScript" },
  { id: "javascript", name: "JavaScript" },
  { id: "python", name: "Python" },
  { id: "java", name: "Java" },
  { id: "c", name: "C" },
  { id: "cpp", name: "C++" },
  { id: "csharp", name: "C#" },
  { id: "go", name: "Go" },
  { id: "rust", name: "Rust" },
  { id: "php", name: "PHP" },
  { id: "ruby", name: "Ruby" },
  { id: "swift", name: "Swift" },
  { id: "kotlin", name: "Kotlin" },
  { id: "html", name: "HTML" },
  { id: "css", name: "CSS" },
  { id: "json", name: "JSON" },
  { id: "markdown", name: "Markdown" },
  { id: "sql", name: "SQL" },
]

export function LanguageSelector({ currentLanguage, onLanguageChange }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false)

  const currentLanguageDisplay = LANGUAGES.find((lang) => lang.id === currentLanguage)?.name || currentLanguage

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 h-8">
          <Code size={14} />
          <span>{currentLanguageDisplay}</span>
          <ChevronDown size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 max-h-80 overflow-y-auto">
        {LANGUAGES.map((language) => (
          <DropdownMenuItem
            key={language.id}
            className={cn("flex items-center justify-between", currentLanguage === language.id && "font-medium")}
            onClick={() => {
              onLanguageChange(language.id)
              setOpen(false)
            }}
          >
            {language.name}
            {currentLanguage === language.id && <Check size={16} />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

