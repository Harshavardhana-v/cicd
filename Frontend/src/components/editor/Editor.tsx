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

// Map file extensions to Monaco language IDs
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
  const { currentSuggestions } = useUIStore();

  function handleEditorDidMount(editor: any, monaco: Monaco) {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // ── Match project tsconfig.json so Monaco stops showing false "Cannot use JSX" errors ──
    const tsDefaults = monaco.languages.typescript.typescriptDefaults;
    tsDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2017,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,   // "react-jsx"
      lib: ['dom', 'dom.iterable', 'esnext'],
      allowJs: true,
      skipLibCheck: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      strict: false,          // keep strict off in editor to avoid noise
      isolatedModules: true,
      resolveJsonModule: true,
      noEmit: true,
    });

    // Suppress all built-in diagnostics — we provide our own analysis engine
    tsDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,   // no red "type" errors
      noSyntaxValidation: false,    // still catch real syntax typos (unclosed braces etc.)
    });

    // Same for plain JavaScript files
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    });

    // Apply custom theme
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
    <div className="h-full w-full relative">
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
          fontSize: 15,
          fontFamily: 'var(--font-jetbrains-mono)',
          lineNumbers: 'on',
          roundedSelection: true,
          scrollBeyondLastLine: false,
          readOnly: false,
          automaticLayout: true,
          padding: { top: 40, bottom: 40 },
          fontLigatures: true,
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          lineHeight: 28,
          letterSpacing: 0.5,
        }}
      />
    </div>
  );
}
