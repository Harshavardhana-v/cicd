"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useUIStore } from '@/store/useStore';
import {
    GitPullRequest, ArrowLeft, Plus, Minus, FileCode,
    Loader2, GitMerge, GitBranch, ChevronRight, User, Clock, AlertCircle
} from 'lucide-react';
import { DiffEditor } from '@monaco-editor/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface PR {
    number: number;
    title: string;
    state: string;
    user: string;
    userAvatar: string;
    createdAt: string;
    headBranch: string;
    baseBranch: string;
    additions: number;
    deletions: number;
    changedFiles: number;
    draft: boolean;
    merged: boolean;
    url: string;
}

interface PRFile {
    filename: string;
    status: 'added' | 'removed' | 'modified' | 'renamed';
    additions: number;
    deletions: number;
    patch: string;
    rawUrl: string;
}

function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

// Parse a unified diff patch into original + modified content strings
function parsePatch(patch: string): { original: string; modified: string } {
    if (!patch) return { original: '// No diff available', modified: '// No diff available' };
    const lines = patch.split('\n');
    const original: string[] = [];
    const modified: string[] = [];
    for (const line of lines) {
        if (line.startsWith('@@')) continue;
        if (line.startsWith('-')) { original.push(line.slice(1)); }
        else if (line.startsWith('+')) { modified.push(line.slice(1)); }
        else { original.push(line); modified.push(line); }
    }
    return { original: original.join('\n'), modified: modified.join('\n') };
}

export default function PRDiffView() {
    const { setView, selectedRepo, repoOwner, repoBranch, setSelectedPR } = useUIStore();
    const [prs, setPRs] = useState<PR[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPRNum, setSelectedPRNum] = useState<number | null>(null);
    const [prFiles, setPRFiles] = useState<PRFile[]>([]);
    const [selectedFile, setSelectedFile] = useState<PRFile | null>(null);
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [prFilter, setPRFilter] = useState<'open' | 'closed' | 'all'>('open');

    // Fetch PR list
    useEffect(() => {
        if (!repoOwner || !selectedRepo) return;
        setLoading(true);
        fetch(`http://localhost:5000/api/github/prs/${repoOwner}/${selectedRepo}?state=${prFilter}&per_page=30`)
            .then(r => r.json())
            .then(d => setPRs(d.prs || []))
            .catch(() => setPRs([]))
            .finally(() => setLoading(false));
    }, [repoOwner, selectedRepo, prFilter]);

    // Fetch files for selected PR
    useEffect(() => {
        if (!selectedPRNum) return;
        setLoadingFiles(true);
        setSelectedFile(null);
        fetch(`http://localhost:5000/api/github/pr-files/${repoOwner}/${selectedRepo}/${selectedPRNum}`)
            .then(r => r.json())
            .then(d => {
                setPRFiles(d.files || []);
                if (d.files?.length > 0) setSelectedFile(d.files[0]);
            })
            .catch(() => setPRFiles([]))
            .finally(() => setLoadingFiles(false));
    }, [selectedPRNum, repoOwner, selectedRepo]);

    const selectedPRData = prs.find(p => p.number === selectedPRNum);
    const diffContent = selectedFile ? parsePatch(selectedFile.patch) : { original: '', modified: '' };

    const getFileLanguage = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase() ?? '';
        const map: Record<string, string> = {
            ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
            css: 'css', json: 'json', md: 'markdown', py: 'python', go: 'go',
        };
        return map[ext] ?? 'plaintext';
    };

    const statusColor = (status: string) => {
        if (status === 'added') return 'text-green-400';
        if (status === 'removed') return 'text-red-400';
        return 'text-blue-400';
    };

    return (
        <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
            {/* Header */}
            <div className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-sidebar/10 backdrop-blur-md flex-shrink-0">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setView('review')}
                        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back
                    </button>
                    <div className="h-6 w-[1px] bg-white/10" />
                    <div className="flex items-center gap-3">
                        <GitPullRequest className="w-5 h-5 text-ai-accent" />
                        <span className="text-sm font-black uppercase tracking-widest">
                            PR Diff Viewer
                        </span>
                        <span className="text-xs opacity-30 font-mono">{repoOwner}/{selectedRepo}</span>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                    {(['open', 'closed', 'all'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setPRFilter(f)}
                            className={cn(
                                "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                prFilter === f ? "bg-ai-accent text-white shadow-lg" : "opacity-30 hover:opacity-60"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* PR List Panel */}
                <aside className="w-[340px] flex-shrink-0 border-r border-white/5 overflow-y-auto bg-sidebar/10">
                    {loading ? (
                        <div className="flex items-center justify-center h-40 opacity-30">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : prs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-3 opacity-30 text-center px-8">
                            <GitPullRequest className="w-8 h-8" />
                            <p className="text-xs font-bold">No {prFilter} PRs found</p>
                        </div>
                    ) : (
                        <div className="p-4 space-y-2">
                            {prs.map(pr => (
                                <button
                                    key={pr.number}
                                    onClick={() => { setSelectedPRNum(pr.number); setSelectedPR(pr.number); }}
                                    className={cn(
                                        "w-full text-left p-4 rounded-2xl border transition-all space-y-3",
                                        selectedPRNum === pr.number
                                            ? "bg-ai-accent/10 border-ai-accent/30"
                                            : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-sm font-bold leading-tight line-clamp-2 flex-1">
                                            {pr.title}
                                        </p>
                                        <span className={cn(
                                            "text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0",
                                            pr.merged ? "bg-purple-500/20 text-purple-300"
                                                : pr.state === 'open' ? "bg-green-500/20 text-green-300"
                                                    : "bg-red-500/20 text-red-300"
                                        )}>
                                            {pr.merged ? 'Merged' : pr.state}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] opacity-40 font-mono">
                                        <span className="flex items-center gap-1">
                                            <User className="w-3 h-3" />{pr.user}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />{timeAgo(pr.createdAt)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1 text-[10px] text-green-400 font-mono">
                                            <Plus className="w-3 h-3" />{pr.additions ?? '?'}
                                        </span>
                                        <span className="flex items-center gap-1 text-[10px] text-red-400 font-mono">
                                            <Minus className="w-3 h-3" />{pr.deletions ?? '?'}
                                        </span>
                                        <span className="flex items-center gap-1 text-[10px] opacity-40 font-mono">
                                            <FileCode className="w-3 h-3" />{pr.changedFiles ?? '?'} files
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px] opacity-30 font-mono">
                                        <GitBranch className="w-3 h-3" />
                                        <span className="truncate">{pr.headBranch}</span>
                                        <ChevronRight className="w-3 h-3" />
                                        <span>{pr.baseBranch}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </aside>

                {/* Diff Viewer Area */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {!selectedPRNum ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4 opacity-20">
                            <GitPullRequest className="w-16 h-16" />
                            <p className="text-sm font-black uppercase tracking-widest">Select a Pull Request</p>
                        </div>
                    ) : loadingFiles ? (
                        <div className="flex-1 flex items-center justify-center opacity-30">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* File tabs strip */}
                            <div className="flex items-center gap-0 border-b border-white/5 overflow-x-auto bg-sidebar/5 flex-shrink-0 scrollbar-hide">
                                {prFiles.map(f => (
                                    <button
                                        key={f.filename}
                                        onClick={() => setSelectedFile(f)}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-3 text-xs font-medium whitespace-nowrap border-r border-white/5 transition-all flex-shrink-0",
                                            selectedFile?.filename === f.filename
                                                ? "bg-ai-accent/10 text-ai-accent border-b-2 border-b-ai-accent"
                                                : "opacity-40 hover:opacity-70"
                                        )}
                                    >
                                        <span className={statusColor(f.status)}>●</span>
                                        {f.filename.split('/').pop()}
                                        <span className="text-green-400 font-mono text-[9px]">+{f.additions}</span>
                                        <span className="text-red-400 font-mono text-[9px]">-{f.deletions}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Monaco Diff Editor */}
                            <div className="flex-1 overflow-hidden">
                                {selectedFile && (
                                    <DiffEditor
                                        height="100%"
                                        language={getFileLanguage(selectedFile.filename)}
                                        original={diffContent.original}
                                        modified={diffContent.modified}
                                        theme="vs-dark"
                                        options={{
                                            readOnly: true,
                                            fontSize: 13,
                                            lineHeight: 24,
                                            minimap: { enabled: false },
                                            scrollBeyondLastLine: false,
                                            renderSideBySide: true,
                                            padding: { top: 20, bottom: 20 },
                                            fontFamily: 'monospace',
                                            fontLigatures: false,
                                            smoothScrolling: false,
                                            cursorBlinking: 'solid',
                                            scrollbar: {
                                                useShadows: false,
                                                verticalScrollbarSize: 10,
                                                horizontalScrollbarSize: 10,
                                            }
                                        }}
                                    />
                                )}
                            </div>

                            {/* Status bar */}
                            {selectedPRData && (
                                <div className="h-8 flex items-center gap-6 px-6 border-t border-white/5 bg-sidebar/10 text-[10px] opacity-40 font-mono flex-shrink-0">
                                    <span>PR #{selectedPRData.number}</span>
                                    <span className="flex items-center gap-1">
                                        <GitMerge className="w-3 h-3" />
                                        {selectedPRData.headBranch} → {selectedPRData.baseBranch}
                                    </span>
                                    {selectedFile && (
                                        <span className="ml-auto">{selectedFile.filename}</span>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
