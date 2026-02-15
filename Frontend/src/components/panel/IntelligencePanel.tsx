"use client";

import React, { useEffect } from 'react';
import { Brain, Zap, ShieldCheck, Clock, MessageSquare, Target, AlertTriangle, Lightbulb, Info, CheckCircle2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useUIStore } from '@/store/useStore';
import { analyzeCode } from '@/services/analysisEngine';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function IntelligencePanel() {
    const { activeFile, setSuggestions, currentSuggestions, codeToReview } = useUIStore();

    useEffect(() => {
        if (codeToReview && activeFile) {
            const suggestions = analyzeCode(codeToReview, activeFile);
            setSuggestions(suggestions);
        }
    }, [codeToReview, activeFile, setSuggestions]);

    const securityRisks = currentSuggestions.filter(s => s.type === 'security').length;
    const optimizations = currentSuggestions.filter(s => s.type === 'optimization').length;

    return (
        <div className="flex flex-col h-full bg-[#050a14]">
            {/* Professional Meter Header */}
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

            {/* AI Suggestions List */}
            <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                <div className="space-y-6">
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

                    {currentSuggestions.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 px-10 border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.01]">
                            <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center border border-white/5 shadow-inner">
                                <CheckCircle2 className="w-8 h-8 opacity-20" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-black uppercase tracking-widest opacity-30">All Modules Safe</p>
                                <p className="text-xs text-muted-foreground opacity-40 font-medium leading-relaxed">No structural risks or optimization patterns found in the current buffer.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {currentSuggestions.map((s) => (
                                <div key={s.id} className={cn(
                                    "p-6 rounded-[32px] border transition-all hover:bg-white/[0.03] group relative overflow-hidden",
                                    s.type === 'security' ? "border-risk-critical/10" : "border-ai-accent/10"
                                )}>
                                    {/* Sidebar indicator */}
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
                                            <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-full border border-white/10">
                                                <div className="w-1.5 h-1.5 rounded-full bg-ai-accent animate-pulse" />
                                                <span className="text-[9px] font-black text-ai-accent uppercase tracking-tighter">
                                                    Match {Math.round(s.confidence * 100)}%
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <h4 className="text-base font-black tracking-tight leading-tight">{s.message}</h4>
                                                <p className="text-xs text-muted-foreground font-medium leading-relaxed opacity-70">
                                                    {s.hint}
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest opacity-30">
                                                    <span>Confidence Spectrum</span>
                                                    <span>{Math.round(s.confidence * 100)}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full transition-all duration-1000",
                                                            s.type === 'security' ? "bg-risk-critical" : "bg-ai-accent"
                                                        )}
                                                        style={{ width: `${s.confidence * 100}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10 flex items-center gap-1.5 grayscale hover:grayscale-0 transition-all cursor-default">
                                                    <div className="w-1 h-1 rounded-full bg-ai-accent" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Novelty: High</span>
                                                </div>
                                                <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10 flex items-center gap-1.5 grayscale hover:grayscale-0 transition-all cursor-default">
                                                    <div className="w-1 h-1 rounded-full bg-ai-accent" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Attn: Weights-v3</span>
                                                </div>
                                            </div>
                                        </div>

                                        {s.fix && (
                                            <div className="p-5 bg-[#0a0f1d] rounded-2xl border border-white/5 space-y-3 shadow-inner group-hover:border-ai-accent/30 transition-colors">
                                                <div className="flex items-center gap-2 opacity-30">
                                                    <Zap className="w-3 h-3 text-ai-accent" />
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Architecture Fix</span>
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
                </div>

                {/* Stream Footer */}
                <div className="space-y-6 pt-10 border-t border-white/5">
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40 flex items-center gap-3">
                        <Clock className="w-4 h-4" /> Reality Stream
                    </h3>
                    <div className="relative pl-6 space-y-6">
                        <div className="absolute left-[3px] top-1.5 bottom-4 w-[1px] bg-white/10" />
                        {[
                            { time: '12:28 AM', label: `Scanning Buffer: ${activeFile || 'Idle'}`, icon: <div className="w-1.5 h-1.5 rounded-full bg-white/20" /> },
                            { time: '12:28 AM', label: 'Analysis Strategy: Context-Aware', icon: <div className="w-1.5 h-1.5 rounded-full bg-ai-accent shadow-[0_0_8px_rgba(139,92,246,0.6)]" /> },
                        ].map((item, i) => (
                            <div key={i} className="relative flex flex-col gap-1">
                                <div className="absolute -left-[26px] top-1.5 flex items-center justify-center">
                                    {item.icon}
                                </div>
                                <span className="text-[9px] font-black opacity-30 uppercase tracking-widest">{item.time}</span>
                                <p className="text-xs font-bold tracking-tight opacity-60 leading-none">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* AI Command Center Input */}
            <div className="p-8 border-t border-white/5 bg-gradient-to-t from-white/[0.02] to-transparent">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-ai-accent/0 via-ai-accent/20 to-ai-accent/0 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-all duration-700 blur" />
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Interrogate the analysis..."
                            className="w-full bg-[#0a0f1d] border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:border-ai-accent/50 transition-all shadow-2xl placeholder:opacity-20 font-medium text-foreground/80"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/5 border border-white/5">
                            <MessageSquare className="w-4 h-4 opacity-20" />
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(139, 92, 246, 0.3);
                }
            `}</style>
        </div>
    );
}
