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
import { OutputPanel } from "./OutputPanel";
import { LanguageSelector } from "./LanguageSelector";
import { ThemeSelector } from "./ThemeSelector";
import { CompileButton } from "./CompileButton";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCode, Settings } from 'lucide-react';
import { useTheme } from "next-themes";

type CollaborativeCodeEditorProps = {
  documentName: string;
  defaultLanguage?: string;
};

// Piston API endpoint
const PISTON_API_URL = "https://emkc.org/api/v2/piston";

// Mapping of editor languages to Piston runtimes
const LANGUAGE_TO_PISTON_RUNTIME: Record<string, string> = {
  "javascript": "nodejs",
  "typescript": "typescript",
  "python": "python3",
  "java": "java",
  "c": "c",
  "cpp": "cpp",
  "csharp": "csharp",
  "go": "go",
  "rust": "rust",
  "ruby": "ruby",
  "php": "php",
};

// Supported languages for compilation via Piston
const COMPILABLE_LANGUAGES = Object.keys(LANGUAGE_TO_PISTON_RUNTIME);

// Collaborative code editor with undo/redo, live cursors, compilation via Piston, and live avatars
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

  useEffect(() => {
  if (!editorRef || !provider) return;
  
  const awareness = provider.awareness as unknown as Awareness;
  
  // Set initial user state with color assigned from Liveblocks
  awareness.setLocalStateField('user', {
    name: userInfo?.name || 'Anonymous',
    color: userInfo?.color || '#000000',
  });
  
  // Track cursor position in Monaco
  const disposable = editorRef.onDidChangeCursorPosition((e) => {
    // Convert Monaco cursor position to pixel coordinates
    const position = editorRef.getScrolledVisiblePosition(e.position);
    
    if (position) {
      // Update the local cursor position in awareness
      awareness.setLocalStateField('cursor', {
        top: position.top,
        left: position.left
      });
    }
  });
  
  return () => {
    disposable.dispose();
    
    // Clear cursor position when unmounting
    awareness.setLocalStateField('cursor', null);
  };
}, [editorRef, provider, userInfo]);

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

  // Execute code using Piston API
  const executeWithPiston = async (code: string, lang: string): Promise<{
    stdout: string;
    stderr: string;
    output: string;
    success: boolean;
  }> => {
    const pistonRuntime = LANGUAGE_TO_PISTON_RUNTIME[lang];
    
    if (!pistonRuntime) {
      throw new Error(`Language '${lang}' is not supported for execution`);
    }
    
    try {
      const response = await fetch(`${PISTON_API_URL}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: pistonRuntime,
          version: '*', // Use latest version
          files: [
            {
              name: `main.${lang === 'typescript' ? 'ts' : lang}`,
              content: code,
            },
          ],
          stdin: '',
          args: [],
          compile_timeout: 10000,
          run_timeout: 3000,
          compile_memory_limit: -1,
          run_memory_limit: -1,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Format the result
      const stdout = data.run.stdout || '';
      const stderr = data.run.stderr || '';
      const compile_error = data.compile?.stderr || '';
      
      const success = !compile_error && !stderr;
      const output = compile_error || stderr || stdout || 'Execution completed with no output';
      
      return {
        stdout,
        stderr: compile_error || stderr,
        output,
        success: success
      };
    } catch (error) {
      console.error('Piston execution error:', error);
      throw error;
    }
  };

  // Handle compilation
  const handleCompile = useCallback(async () => {
    if (!editorRef) return;
    
    setIsCompiling(true);
    setOutput({ content: "Compiling and executing code...", type: "info" });
    setActiveTab("output");
    
    try {
      const code = editorRef.getValue();
      
      if (!COMPILABLE_LANGUAGES.includes(language)) {
        setOutput({
          content: `Language '${language}' compilation is not supported.`,
          type: "error"
        });
        return;
      }
      
      if (code.trim() === "") {
        setOutput({
          content: "Warning: Empty code file",
          type: "error"
        });
        return;
      }
      
      const result = await executeWithPiston(code, language);
      
      setOutput({
        content: result.output,
        type: result.success ? "success" : "error"
      });
      
    } catch (error) {
      setOutput({
        content: `Execution error: ${error instanceof Error ? error.message : String(error)}`,
        type: "error"
      });
    } finally {
      setIsCompiling(false);
    }
  }, [editorRef, language]);

  // Set up editor height on load and resize
  useEffect(() => {
    const setEditorHeight = () => {
      if (editorContainerRef.current) {
        // Calculate height
        const viewportHeight = window.innerHeight;
        const editorContainer = editorContainerRef.current;
        const containerRect = editorContainer.getBoundingClientRect();
        const offsetTop = containerRect.top;
        
        // Set minimum height
        const minHeight = Math.max(400, viewportHeight - offsetTop - 50); // 50px for status bar
        editorContainer.style.height = `${minHeight}px`;
      }
    };

    setEditorHeight();
    window.addEventListener('resize', setEditorHeight);
    
    return () => {
      window.removeEventListener('resize', setEditorHeight);
    };
  }, []);

  return (
     <div className="flex flex-col h-screen border border-gray-20 bg-background text-foreground">
      
    {/* Document Header - similar to text editor */ }
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
          <ThemeSelector />
          <Avatars />
        </div>
      </div>
      
      {/* Editor Container */}
      <ResizablePanelGroup direction="vertical" className="flex-1">
        <ResizablePanel defaultSize={80} minSize={50}>
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
                scrollbar: {
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                  verticalSliderSize: 8,
                  horizontalSliderSize: 8,
                  verticalHasArrows: false,
                  horizontalHasArrows: false,
                  arrowSize: 15
                }
              }}
            />
          </div>
        </ResizablePanel>
        
        <ResizablePanel defaultSize={50} minSize={50}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="border-b border-gray-200 px-4">
              <TabsList>
                <TabsTrigger value="output" className="flex items-center gap-2">Output</TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings size={16} /> Settings
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="output" className="flex-1 p-0 m-0">
              <div className="flex items-center justify-between py-2 px-4 border-b border-gray-200">
                <h3 className="font-medium">Output</h3>
                <CompileButton 
                  onCompile={handleCompile} 
                  isCompiling={isCompiling} 
                  isCompilable={COMPILABLE_LANGUAGES.includes(language)}
                />
              </div>
              <OutputPanel output={output} />
            </TabsContent>
            
            <TabsContent value="settings" className="flex-1 p-4 m-0 overflow-auto">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Editor Settings</h3>
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <span>Word Wrap</span>
                    <button 
                      className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-sm"
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
                      className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-sm"
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
                
                <div className="space-y-2">
                  <h4 className="font-medium">Execution Settings</h4>
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                    <p className="mb-2">Execution is powered by <a href="https://github.com/engineer-man/piston" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">Piston</a></p>
                    <p>Supported languages: {COMPILABLE_LANGUAGES.join(', ')}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
      
      {/* Status Bar - similar to text editor */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-100 border-t border-gray-200 text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className={isConnected ? "w-2 h-2 rounded-full bg-green-500" : "w-2 h-2 rounded-full bg-red-500"}></div>
            <span>{isConnected ? "Connected" : "Disconnected"}</span>
          </div>
          <div>
            {codeStats.lines} lines, {codeStats.characters} characters
          </div>
          <div>
            Language: {language}
          </div>
        </div>
        <div>
          {provider?.awareness?.getStates()?.size || 0} user(s) active
        </div>
      </div>
    </div>
  );
}