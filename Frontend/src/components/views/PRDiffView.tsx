"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useUIStore } from '@/store/useStore';
import {
    GitPullRequest, ArrowLeft, Plus, Minus, FileCode,
    Loader2, GitMerge, GitBranch, ChevronRight, User, Clock, AlertCircle,
    ShieldCheck, Zap, MessageSquare, BrainCircuit, Sparkles, RefreshCw, Info
} from 'lucide-react';
import { DiffEditor, Editor } from '@monaco-editor/react';
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
    headSha: string;
    baseSha: string;
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
    sha: string;
    contentsUrl: string;
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
    const [fullContents, setFullContents] = useState<{ original: string, modified: string } | null>(null);
    const [loadingContent, setLoadingContent] = useState(false);
    const [comparisonMode, setComparisonMode] = useState<'remote' | 'local'>('remote');
    const [prFilter, setPRFilter] = useState<'open' | 'closed' | 'all'>('open');
    const [aiReview, setAiReview] = useState<{ summary: string, reviews: any[], score: number } | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showAiPanel, setShowAiPanel] = useState(false);
    const [isSwapped, setIsSwapped] = useState(false);
    const [viewMode, setViewMode] = useState<'diff' | 'review'>('review');

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

    // Fetch full content for selected file
    useEffect(() => {
        if (!selectedFile || !repoOwner || !selectedRepo || !selectedPRData) return;

        const fetchFullContent = async () => {
            setLoadingContent(true);
            try {
                // 1. Fetch Modified (Head) Content using file SHA from Head
                const headRes = await fetch(`http://localhost:5000/api/github/file-content/${repoOwner}/${selectedRepo}/${selectedFile.sha}`);
                const headData = await headRes.json();

                // 2. Fetch Original (Base) Content
                let baseContent = '';

                if (comparisonMode === 'local') {
                    // Fetch ACTUAL LOCAL file content
                    try {
                        const localRes = await fetch(`http://localhost:5000/api/local/file?filePath=${selectedFile.filename}`);
                        const localData = await localRes.json();
                        baseContent = localData.content || '';
                    } catch (e) {
                        console.error('Failed to fetch local content:', e);
                        baseContent = '// Failed to load local file';
                    }
                } else if (selectedFile.status !== 'added') {
                    // Fetch BASE (GitHub) version
                    try {
                        const baseRes = await fetch(`http://localhost:5000/api/github/file/${repoOwner}/${selectedRepo}?path=${selectedFile.filename}&branch=${selectedPRData.baseSha}`);
                        const baseData = await baseRes.json();
                        baseContent = baseData.content || '';
                    } catch (e) {
                        console.warn('Falling back to patch parsing for original content');
                        baseContent = parsePatch(selectedFile.patch).original;
                    }
                }

                setFullContents({
                    original: baseContent || '// File created in this PR',
                    modified: headData.content || (selectedFile.status === 'removed' ? '// This file was deleted in the Pull Request' : '')
                });
            } catch (err) {
                console.error('Failed to fetch full file content:', err);
                // Fallback to patch if full fetch fails
                const patchData = parsePatch(selectedFile.patch);
                setFullContents(patchData);
            } finally {
                setLoadingContent(false);
            }
        };

        fetchFullContent();
    }, [selectedFile, repoOwner, selectedRepo, selectedPRData, comparisonMode]);

    const diffContent = fullContents || (selectedFile ? parsePatch(selectedFile.patch) : { original: '', modified: '' });

    // Apply swap if enabled
    const finalOriginal = isSwapped ? diffContent.modified : diffContent.original;
    const finalModified = isSwapped ? diffContent.original : diffContent.modified;

    const getFileLanguage = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase() ?? '';
        const map: Record<string, string> = {
            ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
            css: 'css', json: 'json', md: 'markdown', py: 'python', go: 'go',
        };
        return map[ext] ?? 'plaintext';
    };

    const runAiReview = async () => {
        if (!selectedPRNum || prFiles.length === 0) return;
        setIsAnalyzing(true);
        try {
            const response = await fetch('http://localhost:5000/api/analysis/pr-review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prNumber: selectedPRNum, files: prFiles })
            });
            const data = await response.json();
            setAiReview(data);
            setShowAiPanel(true);
        } catch (error) {
            console.error('AI Review failed:', error);
        } finally {
            setIsAnalyzing(false);
        }
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

                {/* AI Review Action */}
                <div className="flex items-center gap-6">
                    {/* Comparison Mode Toggle */}
                    <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
                        <button
                            onClick={() => setComparisonMode('remote')}
                            className={cn(
                                "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                comparisonMode === 'remote' ? "bg-ai-accent text-white" : "opacity-30 hover:opacity-60"
                            )}
                        >
                            Base vs Head
                        </button>
                        <button
                            onClick={() => setComparisonMode('local')}
                            className={cn(
                                "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                comparisonMode === 'local' ? "bg-emerald-500 text-white" : "opacity-30 hover:opacity-60"
                            )}
                        >
                            Local vs Head
                        </button>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                        <button
                            onClick={() => setViewMode('diff')}
                            className={cn(
                                "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                viewMode === 'diff' ? "bg-white/10 text-white" : "opacity-30 hover:opacity-60"
                            )}
                        >
                            Diff
                        </button>
                        <button
                            onClick={() => setViewMode('review')}
                            className={cn(
                                "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                viewMode === 'review' ? "bg-ai-accent text-white" : "opacity-30 hover:opacity-60"
                            )}
                        >
                            Review
                        </button>
                    </div>

                    <div className="h-6 w-[1px] bg-white/10" />

                    {/* Swap Toggle */}
                    <button
                        onClick={() => setIsSwapped(!isSwapped)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                            isSwapped ? "bg-orange-500/20 text-orange-400 border border-orange-500/20" : "bg-white/5 border border-white/5 opacity-40 hover:opacity-100"
                        )}
                        title="Swap Base and Head panels"
                    >
                        <RefreshCw className={cn("w-3.5 h-3.5", isSwapped && "animate-spin-once")} />
                        {isSwapped ? "Swapped" : "Swap Side"}
                    </button>

                    <div className="h-6 w-[1px] bg-white/10" />

                    <button
                        onClick={runAiReview}
                        disabled={!selectedPRNum || isAnalyzing}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                            isAnalyzing ? "bg-ai-accent/20 text-ai-accent animate-pulse cursor-wait" :
                                "bg-ai-accent text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] active:scale-95"
                        )}
                    >
                        {isAnalyzing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Sparkles className="w-4 h-4" />
                        )}
                        {isAnalyzing ? 'Analyzing PR...' : 'Run AI Review'}
                    </button>

                    <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                        {(['open', 'closed', 'all'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setPRFilter(f)}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                    prFilter === f ? "bg-white/10 text-white" : "opacity-30 hover:opacity-60"
                                )}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
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
                            <div className="flex-1 overflow-hidden relative">
                                {loadingContent && (
                                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="w-8 h-8 animate-spin text-ai-accent" />
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Fetching Source...</span>
                                        </div>
                                    </div>
                                )}
                                {selectedFile?.status === 'removed' && (
                                    <div className="absolute top-8 right-8 z-10 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full flex items-center gap-2">
                                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">File Removed in PR</span>
                                    </div>
                                )}
                                {selectedFile?.status === 'added' && (
                                    <div className="absolute top-8 left-8 z-10 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full flex items-center gap-2">
                                        <Plus className="w-3.5 h-3.5 text-green-500" />
                                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">New File Added</span>
                                    </div>
                                )}
                                {selectedFile && (
                                    viewMode === 'diff' ? (
                                        <DiffEditor
                                            height="100%"
                                            language={getFileLanguage(selectedFile.filename)}
                                            original={finalOriginal}
                                            modified={finalModified}
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
                                                scrollbar: {
                                                    useShadows: false,
                                                    verticalScrollbarSize: 10,
                                                    horizontalScrollbarSize: 10,
                                                }
                                            }}
                                        />
                                    ) : (
                                        <Editor
                                            height="100%"
                                            language={getFileLanguage(selectedFile.filename)}
                                            value={selectedFile.status === 'removed' && !isSwapped ? finalOriginal : finalModified}
                                            theme="vs-dark"
                                            options={{
                                                readOnly: true,
                                                fontSize: 14,
                                                lineHeight: 26,
                                                minimap: { enabled: true },
                                                scrollBeyondLastLine: false,
                                                padding: { top: 20, bottom: 20 },
                                                fontFamily: 'monospace',
                                                fontLigatures: false,
                                                wordWrap: 'on',
                                                scrollbar: {
                                                    useShadows: false,
                                                    verticalScrollbarSize: 10,
                                                    horizontalScrollbarSize: 10,
                                                }
                                            }}
                                        />
                                    )
                                )}
                            </div>

                            {/* Status bar */}
                            {selectedPRData && (
                                <div className="h-10 flex items-center gap-6 px-6 border-t border-white/5 bg-sidebar/10 text-[9px] font-mono flex-shrink-0">
                                    <div className="flex items-center gap-2 px-2 py-0.5 bg-white/5 rounded border border-white/10">
                                        <Info className="w-3 h-3 opacity-40" />
                                        <span className="opacity-40 uppercase">Status:</span>
                                        <span className={cn("font-black uppercase", statusColor(selectedFile?.status || ''))}>
                                            {selectedFile?.status || 'unknown'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 opacity-30">
                                        <span>Base SHA: {selectedPRData.baseSha.slice(0, 7)}</span>
                                        <span>Head SHA: {selectedPRData.headSha.slice(0, 7)}</span>
                                    </div>
                                    <div className="flex items-center gap-1 ml-auto opacity-40">
                                        <GitMerge className="w-3 h-3" />
                                        {selectedPRData.headBranch} → {selectedPRData.baseBranch}
                                    </div>
                                    {selectedFile && (
                                        <span className="opacity-40">{selectedFile.filename}</span>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </main>

                {/* AI Review Sidebar */}
                {showAiPanel && aiReview && (
                    <aside className="w-[400px] border-l border-white/5 bg-sidebar/20 backdrop-blur-3xl overflow-y-auto flex flex-col animate-in slide-in-from-right duration-500">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <BrainCircuit className="w-5 h-5 text-ai-accent" />
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-ai-accent">AI Review Panel</h3>
                            </div>
                            <button
                                onClick={() => setShowAiPanel(false)}
                                className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center opacity-40 hover:opacity-100 transition-all"
                            >
                                <ArrowLeft className="w-4 h-4 rotate-180" />
                            </button>
                        </div>

                        <div className="p-8 space-y-10">
                            {/* Score & Summary */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">Quality Score</span>
                                    <span className="text-2xl font-black text-white">{aiReview.score}/100</span>
                                </div>
                                <div className="p-6 rounded-3xl bg-ai-accent/5 border border-ai-accent/10">
                                    <p className="text-xs leading-relaxed opacity-60 italic">
                                        "{aiReview.summary}"
                                    </p>
                                </div>
                            </div>

                            {/* Automated Feedback */}
                            <div className="space-y-6">
                                <h4 className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 flex items-center gap-3">
                                    <MessageSquare className="w-3.5 h-3.5" /> File Insights
                                </h4>
                                <div className="space-y-4">
                                    {aiReview.reviews.map((rev: any, idx: number) => (
                                        rev.issues.length > 0 && (
                                            <div key={idx} className="space-y-3">
                                                <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-lg w-fit">
                                                    <FileCode className="w-3 h-3 opacity-40" />
                                                    <span className="text-[9px] font-mono opacity-50 truncate max-w-[200px]">{rev.filename}</span>
                                                </div>
                                                {rev.issues.map((issue: any, i: number) => (
                                                    <div key={i} className="group p-5 rounded-3xl border border-risk-critical/10 bg-risk-critical/[0.02] hover:bg-risk-critical/[0.05] transition-all">
                                                        <div className="flex items-start gap-4">
                                                            <AlertCircle className="w-4 h-4 text-risk-critical mt-0.5" />
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[9px] font-black text-risk-critical uppercase">{issue.type}</span>
                                                                    <span className="text-[9px] opacity-20 font-mono">Line {issue.line}</span>
                                                                </div>
                                                                <p className="text-[11px] font-medium leading-relaxed">{issue.message}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto p-8 border-t border-white/5 bg-black/20">
                            <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all">
                                Export Review Report
                            </button>
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
}
