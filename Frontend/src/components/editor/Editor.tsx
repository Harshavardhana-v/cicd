"use client";

import React, { useRef, useEffect } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { useUIStore } from '@/store/useStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Target } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
  const { currentSuggestions, isPrivacyMode, isMacroView, graphData } = useUIStore();
  const secretDecorationIdsRef = useRef<string[]>([]);

  // ── Memory Management: Disposal ─────────────────────────────
  useEffect(() => {
    return () => {
      // Explicitly dispose of decorations and clean up references
      if (editorRef.current) {
        editorRef.current.deltaDecorations(decorationIdsRef.current, []);
        editorRef.current.deltaDecorations(secretDecorationIdsRef.current, []);
      }
      // Although @monaco-editor/react handles much of this, 
      // clearing our refs helps prevent closure-related leaks.
      editorRef.current = null;
      monacoRef.current = null;
    };
  }, []);

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
    detectAndMaskSecrets();
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

  const detectAndMaskSecrets = () => {
    if (!editorRef.current || !monacoRef.current || !isPrivacyMode) {
      if (editorRef.current) secretDecorationIdsRef.current = editorRef.current.deltaDecorations(secretDecorationIdsRef.current, []);
      return;
    }

    const model = editorRef.current.getModel();
    if (!model) return;

    const content = model.getValue();
    const secrets: any[] = [];

    // Patterns for common secrets
    const patterns = [
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Email
      /(?:key|token|secret|password|passwd|auth)[\s:=]+['"]?([a-zA-Z0-9_\-\.]{12,})['"]?/gi, // Potential Generic Secret
      /xox[baprs]-[0-9a-zA-Z]{10,}/g, // Slack Token
      /AKIA[0-9A-Z]{16}/g, // AWS Access Key
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        // If it's the generic one with a捕获组, we want to mask the value, not the key
        const matchText = match[1] || match[0];
        const index = match.index + (match[0].indexOf(matchText));
        const startPos = model.getPositionAt(index);
        const endPos = model.getPositionAt(index + matchText.length);

        secrets.push({
          range: new monacoRef.current!.Range(startPos.lineNumber, startPos.column, endPos.lineNumber, endPos.column),
          options: {
            inlineClassName: 'pii-mask',
            hoverMessage: { value: '**Sensitive Data Masked**\n\nCodeSage detected a potential secret or PII here. Privacy Mode is active.' },
            stickiness: monacoRef.current!.editor.TrackedRangeStickiness.NeverGratefulSelection
          }
        });
      }
    });

    secretDecorationIdsRef.current = editorRef.current.deltaDecorations(secretDecorationIdsRef.current, secrets);
  };

  useEffect(() => {
    updateDecorations();
  }, [currentSuggestions]);

  useEffect(() => {
    detectAndMaskSecrets();
  }, [isPrivacyMode, code]);

  return (
    <div className="h-full w-full relative group">
      {/* Privacy Overlay (Whole Editor Blur) */}
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

      <div className={cn(
        "h-full w-full transition-all duration-700",
        isMacroView ? "blur-[2px] grayscale-[0.8] scale-[0.98] opacity-40 select-none pointer-events-none" : "blur-0 grayscale-0 scale-100 opacity-100"
      )}>
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
            automaticLayout: true,
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
            revealHorizontalRightPadding: 0,
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

      {/* Macro View Overlay (Architecture View) */}
      {isMacroView && (
        <div className="absolute inset-x-8 inset-y-12 z-[150] flex flex-col items-center justify-center p-12 text-center pointer-events-none animate-in fade-in zoom-in-95 duration-700">
          <div className="w-24 h-24 rounded-full bg-ai-accent/10 border border-ai-accent/20 flex items-center justify-center mb-6">
            <div className="w-4 h-4 rounded-full bg-ai-accent animate-ping" />
          </div>
          <div className="space-y-2 mb-12">
            <h2 className="text-2xl font-black uppercase tracking-[0.4em] text-ai-accent shadow-2xl">Semantic Architecture View</h2>
            <p className="text-xs font-bold opacity-40 uppercase tracking-[0.2em] max-w-sm">
              Abstracting code into functional blocks. Showing core structure of {fileName?.split('/').pop() || 'current file'}.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-2xl pointer-events-auto">
            {graphData.nodes.filter(n => n.type !== 'file').slice(0, 9).map((node) => (
              <div key={node.id} className="p-5 rounded-[24px] bg-white/[0.03] border border-white/5 flex flex-col items-center gap-2 hover:bg-white/10 hover:border-ai-accent/30 transition-all duration-500 backdrop-blur-md group/node">
                <div className={cn(
                  "px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                  node.type === 'function' ? "bg-ai-accent/20 text-ai-accent" :
                    node.type === 'class' ? "bg-emerald-500/20 text-emerald-500" : "bg-white/10"
                )}>
                  {node.type}
                </div>
                <span className="text-[11px] font-black tracking-tighter truncate w-full">{node.label}</span>
              </div>
            ))}
            {graphData.nodes.filter(n => n.type !== 'file').length === 0 && (
              <div className="col-span-full py-16 flex flex-col items-center gap-4 border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.01]">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Target className="w-6 h-6 opacity-20" />
                </div>
                <p className="text-[10px] uppercase opacity-20 font-black tracking-[0.3em]">
                  Scanning Structural Patterns...
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
