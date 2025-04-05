"use client";

import { getYjsProviderForRoom } from "@liveblocks/yjs";
import { useRoom, useSelf } from "@liveblocks/react/suspense";
import { useCallback, useEffect, useState, useRef } from "react";
import { Avatars } from "./Avatars";
import { Editor } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { MonacoBinding } from "y-monaco";
import { Awareness } from "y-protocols/awareness";
import { Cursors } from "./Cursors";
import { Toolbar } from "./Toolbar";
import { StatusBar } from "./StatusBar";
import { OutputPanel } from "./OutputPanel";
import { LanguageSelector } from "./LanguageSelector";
import { ThemeSelector } from "./ThemeSelector";
import { CompileButton } from "./CompileButton";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCode, Settings } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

type CollaborativeCodeEditorProps = {
  documentName: string;
  defaultLanguage?: string;
};

// Supported languages for compilation
const COMPILABLE_LANGUAGES = [
  "javascript", 
  "typescript", 
  "python", 
  "java", 
  "c", 
  "cpp", 
  "csharp",
  "go",
  "rust"
];

// Collaborative code editor with undo/redo, live cursors, compilation, and live avatars
export function CollaborativeCodeEditor({ 
  documentName, 
  defaultLanguage = "typescript" 
}: CollaborativeCodeEditorProps) {
  const room = useRoom();
  const [isConnected, setIsConnected] = useState(false);
  const [editorRef, setEditorRef] = useState<editor.IStandaloneCodeEditor>();
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [codeStats, setCodeStats] = useState({ lines: 0, characters: 0 });
  const [language, setLanguage] = useState(defaultLanguage);
  const [editorTheme, setEditorTheme] = useState<string>("vs-light");
  const { theme } = useTheme();
  const [output, setOutput] = useState<{
    content: string;
    type: "success" | "error" | "info";
  }>({ content: "Output will appear here after compilation", type: "info" });
  const [isCompiling, setIsCompiling] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("output");
  
  // Get user info from Liveblocks authentication endpoint
  const userInfo = useSelf((me) => me.info);
  
  // Set up Liveblocks Yjs provider
  const provider = getYjsProviderForRoom(room);

  // Monitor connection status
  useEffect(() => {
    if (provider) {
      provider.awareness.on('change', () => {
        setIsConnected(true);
      });
    }
  }, [provider]);

  // Update editor theme when system theme changes
  useEffect(() => {
    setEditorTheme(theme === "dark" ? "vs-dark" : "vs-light");
  }, [theme]);

  // Set up Yjs and Monaco binding
  useEffect(() => {
    let binding: MonacoBinding;

    if (editorRef && provider) {
      const yDoc = provider.getYDoc();
      const yText = yDoc.getText("monaco");

      // Attach Yjs to Monaco
      binding = new MonacoBinding(
        yText,
        editorRef.getModel() as editor.ITextModel,
        new Set([editorRef]),
        provider.awareness as unknown as Awareness
      );

      // Update stats on content change
      editorRef.onDidChangeModelContent(() => {
        const model = editorRef.getModel();
        if (model) {
          setCodeStats({
            lines: model.getLineCount(),
            characters: model.getValueLength()
          });
        }
      });
    }

    return () => {
      binding?.destroy();
    };
  }, [editorRef, provider]);

  // Handle editor mounting
  const handleOnMount = useCallback((e: editor.IStandaloneCodeEditor) => {
    setEditorRef(e);
    
    // Initialize stats
    const model = e.getModel();
    if (model) {
      setCodeStats({
        lines: model.getLineCount(),
        characters: model.getValueLength()
      });
    }
  }, []);

  // Handle language change
  const handleLanguageChange = useCallback((newLanguage: string) => {
    setLanguage(newLanguage);
    if (editorRef) {
      const model = editorRef.getModel();
      if (model) {
        editor.setModelLanguage(model, newLanguage);
      }
    }
  }, [editorRef]);

  // Handle compilation
  const handleCompile = useCallback(async () => {
    if (!editorRef) return;
    
    setIsCompiling(true);
    setOutput({ content: "Compiling...", type: "info" });
    setActiveTab("output");
    
    try {
      const code = editorRef.getValue();
      
      // In a real app, you would send this to a backend service
      // This is a mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock compilation result based on language
      if (COMPILABLE_LANGUAGES.includes(language)) {
        // Check for some basic errors
        if (code.includes("console.lg") && (language === "javascript" || language === "typescript")) {
          setOutput({
            content: "Error: 'console.lg' is not a function. Did you mean 'console.log'?",
            type: "error"
          });
        } else if (code.trim() === "") {
          setOutput({
            content: "Warning: Empty code file",
            type: "error"
          });
        } else {
          // Mock successful compilation
          setOutput({
            content: `Compilation successful!\n\n${mockOutput(code, language)}`,
            type: "success"
          });
        }
      } else {
        setOutput({
          content: `Language '${language}' compilation is not supported.`,
          type: "error"
        });
      }
    } catch (error) {
      setOutput({
        content: `Compilation error: ${error instanceof Error ? error.message : String(error)}`,
        type: "error"
      });
    } finally {
      setIsCompiling(false);
    }
  }, [editorRef, language]);

  // Mock output generation based on language and code
  const mockOutput = (code: string, lang: string): string => {
    switch (lang) {
      case "javascript":
      case "typescript":
        if (code.includes("console.log")) {
          return code
            .split("\n")
            .filter(line => line.includes("console.log"))
            .map(line => {
              const match = line.match(/console\.log$$['"](.+)['"]$$/);
              return match ? match[1] : "";
            })
            .filter(Boolean)
            .join("\n");
        }
        return "Program executed successfully with no output";
      
      case "python":
        if (code.includes("print")) {
          return code
            .split("\n")
            .filter(line => line.includes("print"))
            .map(line => {
              const match = line.match(/print$$['"](.+)['"]$$/);
              return match ? match[1] : "";
            })
            .filter(Boolean)
            .join("\n");
        }
        return "Program executed successfully with no output";
        
      default:
        return "Program compiled and executed successfully";
    }
  };

  return (
    <div className="flex flex-col h-screen border border-gray-20 bg-background text-foreground">
      
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <FileCode size={20} />
          <h1 className="text-xl font-semibold m-0 text-gray-900 whitespace-nowrap overflow-auto text-ellipsis">
            {documentName}
          </h1>
        </div>
      </div>
      
      {/* Editor Header - similar to text editor */}
      <div className="flex justify-between items-center border-b border-gray-200 bg-gray-100 px-4 py-2">
        <div className="flex items-center gap-2">
          {editorRef ? <Toolbar editor={editorRef} /> : null}
        </div>
        <div className="flex items-center gap-2">
        
          <LanguageSelector 
            currentLanguage={language} 
            onLanguageChange={handleLanguageChange} 
          />
    <CompileButton 
            onCompile={handleCompile} 
            isCompiling={isCompiling} 
            isCompilable={COMPILABLE_LANGUAGES.includes(language)}
          />
      
          <ThemeSelector />
          <Avatars />
      
        </div>
      </div>
      
      
      <ResizablePanelGroup direction="vertical" className="flex-1">
        <ResizablePanel defaultSize={70} minSize={30}>
          <div className="h-full relative" ref={editorContainerRef}>
            {provider ? <Cursors yProvider={provider} /> : null}
            <Editor
              onMount={handleOnMount}
              height="100%"
              width="100%"
              theme={editorTheme}
              defaultLanguage={language}
              defaultValue=""
              options={{
                tabSize: 2,
                padding: { top: 20 },
                minimap: { enabled: true },
                lineNumbers: "on",
                renderLineHighlight: "all",
                wordWrap: "on",
                automaticLayout: true,
              }}
            />
          </div>
        </ResizablePanel>
        
        <ResizablePanel defaultSize={30} minSize={20}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="border-b px-4">
              <TabsList>
                <TabsTrigger value="output">Output</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="output" className="flex-1 p-0 m-0">
              <OutputPanel output={output} />
            </TabsContent>
            
            <TabsContent value="settings" className="flex-1 p-4 m-0 overflow-auto">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Editor Settings</h3>
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <span>Word Wrap</span>
                    <button 
                      className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-700"
                      onClick={() => {
                        if (editorRef) {
                          const currentOptions = editorRef.getOption(editor.EditorOption.wordWrap);
                          editorRef.updateOptions({ 
                            wordWrap: currentOptions === 'on' ? 'off' : 'on' 
                          });
                        }
                      }}
                    >
                      Toggle
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Minimap</span>
                    <button 
                      className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-700"
                      onClick={() => {
                        if (editorRef) {
                          const currentOptions = editorRef.getOption(editor.EditorOption.minimap);
                          editorRef.updateOptions({ 
                            minimap: { enabled: !currentOptions.enabled } 
                          });
                        }
                      }}
                    >
                      Toggle
                    </button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
      
      <StatusBar 
        codeStats={codeStats} 
        isConnected={isConnected} 
        activeUsers={provider?.awareness?.getStates()?.size || 0}
        language={language}
      />
    </div>
  );
}
