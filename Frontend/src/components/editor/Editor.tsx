"use client";

import React, { useRef, useEffect } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { useUIStore } from '@/store/useStore';

interface CodeEditorProps {
  code?: string;
  language?: string;
  fileName?: string;
}

const defaultCode = `// Select a file from the Navigator to start deep analysis.
// CodeSage is currently tracking structural changes in this repository.`;

function getLanguageFromFile(fileName?: string, fallback = 'typescript'): string {
  if (!fileName) return fallback;
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript',
    js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript',
    css: 'css', scss: 'scss', less: 'less',
    json: 'json',
    md: 'markdown', mdx: 'markdown',
    html: 'html', htm: 'html',
    py: 'python',
    go: 'go',
    rs: 'rust',
    java: 'java',
    cpp: 'cpp', c: 'c',
    sh: 'shell', bash: 'shell',
    yaml: 'yaml', yml: 'yaml',
    xml: 'xml',
    sql: 'sql',
    txt: 'plaintext',
    lock: 'plaintext',
    env: 'plaintext',
    gitignore: 'plaintext',
  };
  return map[ext] ?? 'plaintext';
}

export default function CodeEditor({ code = defaultCode, language, fileName }: CodeEditorProps) {
  const resolvedLanguage = language ?? getLanguageFromFile(fileName);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const decorationIdsRef = useRef<string[]>([]);
  const { currentSuggestions, isPrivacyMode } = useUIStore();

  function handleEditorDidMount(editor: any, monaco: Monaco) {
    editorRef.current = editor;
    monacoRef.current = monaco;

    const tsDefaults = monaco.languages.typescript.typescriptDefaults;
    tsDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2017,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
      lib: ['dom', 'dom.iterable', 'esnext'],
      allowJs: true,
      skipLibCheck: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      strict: false,
      isolatedModules: true,
      resolveJsonModule: true,
      noEmit: true,
    });

    tsDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    });

    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    });

    monaco.editor.defineTheme('codesage-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: '8b5cf6' },
        { token: 'string', foreground: '34d399' },
      ],
      colors: {
        'editor.background': '#050a14',
        'editor.lineHighlightBackground': '#0f172a',
        'editorCursor.foreground': '#8B5CF6',
        'editorIndentGuide.activeBackground': '#334155',
        'editorGutter.background': '#050a14',
      }
    });

    monaco.editor.setTheme('codesage-dark');
    updateDecorations();
  }

  const updateDecorations = () => {
    if (!editorRef.current || !monacoRef.current) return;

    const decorations = currentSuggestions.map(s => ({
      range: new monacoRef.current!.Range(s.line, 1, s.line, 1),
      options: {
        isWholeLine: true,
        glyphMarginClassName: 'ai-gutter-icon',
        glyphMarginHoverMessage: { value: `**AI Insight (${Math.round(s.confidence * 100)}%)**\n\n${s.message}` },
        className: s.type === 'security' ? 'ai-line-highlight-security' : 'ai-line-highlight-opt',
        stickiness: monacoRef.current!.editor.TrackedRangeStickiness.NeverGratefulSelection
      }
    }));

    decorationIdsRef.current = editorRef.current.deltaDecorations(decorationIdsRef.current, decorations);
  };

  useEffect(() => {
    updateDecorations();
  }, [currentSuggestions]);

  return (
    <div className="h-full w-full relative group">
      {/* Privacy Overlay */}
      {isPrivacyMode && (
        <div className="absolute inset-x-8 inset-y-12 privacy-overlay flex flex-col items-center justify-center gap-6 animate-in fade-in duration-500 rounded-3xl overflow-hidden border border-white/5 shadow-2xl z-[100] cursor-not-allowed">
          <div className="w-16 h-16 rounded-3xl bg-risk-critical/10 flex items-center justify-center border border-risk-critical/20">
            <div className="w-3 h-3 rounded-full bg-risk-critical animate-ping" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-risk-critical">Privacy Mode Active</h3>
            <p className="text-[11px] font-bold opacity-40 uppercase tracking-widest leading-relaxed max-w-[200px]">Code is currently blurred for security during screen presentation.</p>
          </div>
        </div>
      )}

      <style jsx global>{`
                .ai-gutter-icon {
                    background-color: #8B5CF6;
                    border-radius: 50%;
                    width: 10px !important;
                    height: 10px !important;
                    margin-left: 5px;
                    margin-top: 5px;
                    box-shadow: 0 0 15px #8B5CF6;
                }
                .ai-line-highlight-security {
                    background: rgba(239, 68, 68, 0.08);
                    border-left: 4px solid #EF4444;
                }
                .ai-line-highlight-opt {
                    background: rgba(139, 92, 246, 0.05);
                    border-left: 4px solid #8B5CF6;
                }
                .monaco-editor .scroll-decoration {
                  box-shadow: none !important;
                }
                .monaco-editor .view-line, 
                .monaco-editor .view-lines,
                .monaco-editor .lines-content { 
                  transition: none !important; 
                  animation: none !important;
                }
            `}</style>
      <Editor
        height="100%"
        language={resolvedLanguage}
        value={code}
        path={fileName}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: true, scale: 0.75 },
          glyphMargin: true,
          fontSize: 14,
          fontFamily: 'monospace',
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          readOnly: false,
          automaticLayout: false,
          padding: { top: 10, bottom: 10 },
          fontLigatures: false,
          cursorSmoothCaretAnimation: 'off',
          smoothScrolling: false,
          hideCursorInOverviewRuler: true,
          fixedOverflowWidgets: true,
          renderLineHighlight: 'none',
          renderWhitespace: 'none',
          cursorBlinking: 'solid',
          letterSpacing: 0,
          guides: { indentation: false },
          stopRenderingLineAfter: -1,
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            useShadows: false,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          }
        }}
      />
    </div>
  );
}
