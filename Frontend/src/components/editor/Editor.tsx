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

export default function CodeEditor({ code = defaultCode, language = 'typescript', fileName }: CodeEditorProps) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const decorationIdsRef = useRef<string[]>([]);
  const { currentSuggestions } = useUIStore();

  function handleEditorDidMount(editor: any, monaco: Monaco) {
    editorRef.current = editor;
    monacoRef.current = monaco;

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
        defaultLanguage={language}
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
