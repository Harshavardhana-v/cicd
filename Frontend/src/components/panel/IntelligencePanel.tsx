"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Brain, Zap, ShieldCheck, Clock, MessageSquare, Target, AlertTriangle, Lightbulb, CheckCircle2, GitPullRequest, Copy, Check, Filter } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useUIStore } from '@/store/useStore';
import { analyzeCode } from '@/services/analysisEngine';

import { sanitizeAIContent } from '@/lib/security';
import { sensory } from '@/lib/sensory';
import { IntelligencePanelSkeleton } from '../ui/Skeletons';
import ReviewTimeline from './ReviewTimeline';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type FilterType = 'all' | 'security' | 'optimization';

const CODE_EXTENSIONS = ['.js', '.ts', '.tsx', '.jsx', '.py', '.java', '.go', '.rs', '.cpp', '.c', '.php', '.rb', '.swift', '.kt'];

export default function IntelligencePanel() {
    const { activeFile, setSuggestions, currentSuggestions, codeToReview, selectedRepo, setView, setGraphData } = useUIStore();
    const [filter, setFilter] = useState<FilterType>('all');
    const [keyword, setKeyword] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // ── Run analysis engine ────────────────────────────────────────
    useEffect(() => {
        if (!activeFile) {
            setSuggestions([]);
            setGraphData({ nodes: [], edges: [] });
            return;
        }
        const isCode = CODE_EXTENSIONS.some(ext => activeFile.toLowerCase().endsWith(ext));
        if (!isCode) {
            setSuggestions([]);
            setGraphData({ nodes: [], edges: [] });
            return;
        }
        if (codeToReview) {
            setIsAnalyzing(true);
            const timer = setTimeout(() => {
                const { suggestions, graphData } = analyzeCode(codeToReview, activeFile);
                setSuggestions(suggestions ?? []);
                setGraphData(graphData ?? { nodes: [], edges: [] });
                setIsAnalyzing(false);

                // sensory feedback
                if (suggestions && suggestions.length > 0) {
                    sensory.playSuccessChime();
                    if (suggestions.some(s => s.type === 'security')) {
                        setTimeout(() => sensory.playRiskAlert(), 300);
                    }
                }
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [codeToReview, activeFile, setSuggestions, setGraphData]);

    // ── Listen for CommandPalette filter events ────────────────────
    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail as FilterType;
            setFilter(detail);
        };
        window.addEventListener('codesage:filter', handler);
        return () => window.removeEventListener('codesage:filter', handler);
    }, []);

    // ── Copy fix to clipboard ─────────────────────────────────────
    const copyFix = (id: string, fix: string) => {
        navigator.clipboard.writeText(fix).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    // ── Filtered list ─────────────────────────────────────────────
    const filtered = currentSuggestions
        .filter(s => filter === 'all' || s.type === filter)
        .filter(s => !keyword || s.message.toLowerCase().includes(keyword.toLowerCase()) || s.hint.toLowerCase().includes(keyword.toLowerCase()));

    const securityRisks = currentSuggestions.filter(s => s.type === 'security').length;
    const optimizations = currentSuggestions.filter(s => s.type === 'optimization').length;

    if (isAnalyzing) return <IntelligencePanelSkeleton />;

    return (
        <div className="flex flex-col h-full bg-[#050a14]">
            {/* System Health Header */}
            <div className="p-8 border-b border-white/5 space-y-8 bg-gradient-to-b from-white/[0.02] to-transparent">
                <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40 flex items-center gap-3">
                        <Target className="w-4 h-4" /> System Health
                    </h3>
                    <div className="px-3 py-1 bg-ai-accent/10 border border-ai-accent/20 rounded-full">
                        <span className="text-[9px] font-black text-ai-accent uppercase tracking-widest">v2.4 Live Scan</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className={cn(
                        "p-5 rounded-3xl border transition-all duration-500 flex flex-col gap-1",
                        securityRisks > 0 ? "bg-risk-critical/5 border-risk-critical/20" : "bg-white/[0.02] border-white/5"
                    )}>
                        <div className="flex items-center justify-between opacity-40">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-right">Security</span>
                        </div>
                        <span className={cn("text-3xl font-black italic tracking-tighter", securityRisks > 0 ? "text-risk-critical" : "opacity-10")}>
                            {securityRisks.toString().padStart(2, '0')}
                        </span>
                    </div>

                    <div className={cn(
                        "p-5 rounded-3xl border transition-all duration-500 flex flex-col gap-1",
                        optimizations > 0 ? "bg-ai-accent/5 border-ai-accent/20" : "bg-white/[0.02] border-white/5"
                    )}>
                        <div className="flex items-center justify-between opacity-40">
                            <Zap className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-right">Optimise</span>
                        </div>
                        <span className={cn("text-3xl font-black italic tracking-tighter", optimizations > 0 ? "text-ai-accent" : "opacity-10")}>
                            {optimizations.toString().padStart(2, '0')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Engine Insights */}
            <div className="p-8 space-y-6 flex-1 overflow-y-auto custom-scrollbar">

                {/* Header + Filter Tabs */}
                <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40 flex items-center gap-3">
                        <Brain className="w-4 h-4" /> Engine Insights
                    </h3>
                    {currentSuggestions.length > 0 && (
                        <span className="text-[10px] font-black text-ai-accent bg-ai-accent/10 px-2 py-0.5 rounded-md border border-ai-accent/20">
                            {currentSuggestions.length} DETECTED
                        </span>
                    )}
                </div>

                {/* Filter Tabs */}
                {currentSuggestions.length > 0 && (
                    <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/5">
                        {(['all', 'security', 'optimization'] as FilterType[]).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                    filter === f
                                        ? f === 'security' ? "bg-risk-critical/20 text-risk-critical"
                                            : f === 'optimization' ? "bg-ai-accent/20 text-ai-accent"
                                                : "bg-white/10 text-foreground"
                                        : "opacity-30 hover:opacity-60"
                                )}
                            >
                                {f === 'all' ? 'All' : f === 'security' ? '🔒 Security' : '⚡ Optim.'}
                            </button>
                        ))}
                    </div>
                )}

                {/* Keyword filter */}
                {currentSuggestions.length > 0 && (
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 opacity-20" />
                        <input
                            type="text"
                            value={keyword}
                            onChange={e => setKeyword(e.target.value)}
                            placeholder="Filter analysis results..."
                            className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-2.5 pl-8 pr-4 text-xs focus:outline-none focus:border-ai-accent/30 transition-all placeholder:opacity-20 font-medium"
                        />
                    </div>
                )}

                {/* Suggestions list */}
                {filtered.length === 0 ? (
                    <div className="py-16 flex flex-col items-center justify-center text-center space-y-4 px-10 border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.01]">
                        <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center border border-white/5 shadow-inner">
                            <CheckCircle2 className="w-8 h-8 opacity-20" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-black uppercase tracking-widest opacity-30">
                                {currentSuggestions.length > 0 ? 'No matches' : 'All Modules Safe'}
                            </p>
                            <p className="text-xs text-muted-foreground opacity-40 font-medium leading-relaxed">
                                {currentSuggestions.length > 0
                                    ? 'Try adjusting your filter or keyword.'
                                    : 'No structural risks or optimization patterns found in the current buffer.'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {filtered.map((s) => (
                            <div
                                key={s.id}
                                onMouseEnter={() => { if (s.type === 'security') sensory.triggerHapticPulse(15); }}
                                className={cn(
                                    "p-6 rounded-[32px] border transition-all hover:bg-white/[0.03] group relative overflow-hidden",
                                    s.type === 'security' ? "border-risk-critical/10" : "border-ai-accent/10"
                                )}
                            >
                                <div className={cn(
                                    "absolute left-0 top-1/4 bottom-1/4 w-[3px] rounded-r-full",
                                    s.type === 'security' ? "bg-risk-critical" : "bg-ai-accent"
                                )} />

                                <div className="space-y-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "p-2 rounded-xl",
                                                s.type === 'security' ? "bg-risk-critical/10 text-risk-critical" : "bg-ai-accent/10 text-ai-accent"
                                            )}>
                                                {s.type === 'security' ? <ShieldCheck className="w-4 h-4" /> : <Lightbulb className="w-4 h-4" />}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Line {s.line}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-full border border-white/10">
                                                <div className="w-1.5 h-1.5 rounded-full bg-ai-accent animate-pulse" />
                                                <span className="text-[9px] font-black text-ai-accent uppercase tracking-tighter">
                                                    {Math.round(s.confidence * 100)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h4
                                            className="text-base font-black tracking-tight leading-tight"
                                            dangerouslySetInnerHTML={{ __html: sanitizeAIContent(s.message) }}
                                        />
                                        <p
                                            className="text-xs text-muted-foreground font-medium leading-relaxed opacity-70"
                                            dangerouslySetInnerHTML={{ __html: sanitizeAIContent(s.hint) }}
                                        />
                                    </div>

                                    {/* Confidence bar */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest opacity-30">
                                            <span>Confidence Spectrum</span>
                                            <span>{Math.round(s.confidence * 100)}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                            <div
                                                className={cn("h-full rounded-full transition-all duration-1000", s.type === 'security' ? "bg-risk-critical" : "bg-ai-accent")}
                                                style={{ width: `${s.confidence * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Counterfactual Explanations (What-if) */}
                                    {s.type === 'security' && (
                                        <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30">Counterfactual</span>
                                                <div className="px-2 py-0.5 rounded-md bg-risk-critical/10 text-[8px] font-black text-risk-critical uppercase">Interactive</div>
                                            </div>
                                            <div className="flex items-center justify-between gap-4 p-2 bg-black/20 rounded-xl border border-white/5">
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-bold opacity-60">"If this input was sanitized..."</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-emerald-500">-35% RISK</span>
                                                    <div className="w-8 h-4 bg-white/10 rounded-full relative cursor-pointer hover:bg-white/20 transition-colors">
                                                        <div className="absolute left-1 top-1 bottom-1 w-2 bg-white/40 rounded-full" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Fix suggestion with copy button */}
                                    {s.fix && (
                                        <div className="p-4 bg-[#0a0f1d] rounded-2xl border border-white/5 space-y-2 shadow-inner group-hover:border-ai-accent/20 transition-colors">
                                            <div className="flex items-center justify-between opacity-30">
                                                <div className="flex items-center gap-2">
                                                    <Zap className="w-3 h-3 text-ai-accent" />
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Fix Suggestion</span>
                                                </div>
                                                <button
                                                    onClick={() => copyFix(s.id, s.fix!)}
                                                    className="flex items-center gap-1 hover:opacity-100 transition-opacity p-1 hover:bg-white/5 rounded-lg"
                                                    title="Copy fix"
                                                >
                                                    {copiedId === s.id
                                                        ? <Check className="w-3.5 h-3.5 text-green-400" />
                                                        : <Copy className="w-3.5 h-3.5" />
                                                    }
                                                </button>
                                            </div>
                                            <code className="block text-[11px] text-ai-accent/90 leading-relaxed font-mono whitespace-pre-wrap">
                                                {s.fix}
                                            </code>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Phase 5: Review Timeline */}
                <ReviewTimeline />

                {/* PR Diff CTA */}
                {selectedRepo && (
                    <button
                        onClick={() => setView('diff')}
                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-ai-accent/5 border border-ai-accent/20 hover:bg-ai-accent/10 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <GitPullRequest className="w-4 h-4 text-ai-accent" />
                            <span className="text-xs font-black uppercase tracking-widest text-ai-accent">Open PR Diff Viewer</span>
                        </div>
                        <span className="text-ai-accent opacity-40 group-hover:opacity-100 transition-opacity">→</span>
                    </button>
                )}
            </div>

            {/* Bottom Input */}
            <div className="p-8 border-t border-white/5 bg-gradient-to-t from-white/[0.02] to-transparent">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-ai-accent/0 via-ai-accent/20 to-ai-accent/0 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-all duration-700 blur" />
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Interrogate the analysis..."
                            className="w-full bg-[#0a0f1d] border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:border-ai-accent/50 transition-all shadow-2xl placeholder:opacity-20 font-medium text-foreground/80"
                            onChange={e => setKeyword(e.target.value)}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/5 border border-white/5">
                            <MessageSquare className="w-4 h-4 opacity-20" />
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(139,92,246,0.3); }
            `}</style>
        </div>
    );
}
