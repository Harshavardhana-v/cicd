"use client";

import React, { useEffect } from 'react';
import { Brain, Zap, ShieldCheck, Clock, MessageSquare, Target, AlertTriangle, Lightbulb } from 'lucide-react';
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
        <div className="flex flex-col h-full bg-sidebar/10 backdrop-blur-md">
            {/* Risk Metrics */}
            <div className="p-8 border-b border-white/5 space-y-6 bg-white/[0.02]">
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Global Risk Index
                </h3>
                <div className="flex gap-6">
                    <div className={cn(
                        "flex-1 p-6 rounded-[24px] flex flex-col items-center border transition-all duration-500",
                        securityRisks > 0 ? "bg-risk-critical/10 border-risk-critical/20 shadow-[0_10px_30px_rgba(239,68,68,0.15)]" : "bg-white/5 border-white/5"
                    )}>
                        <span className={cn("text-4xl font-black mb-1", securityRisks > 0 ? "text-risk-critical" : "opacity-20")}>
                            {securityRisks}
                        </span>
                        <span className="text-[10px] uppercase font-black tracking-widest opacity-60 text-center">Security</span>
                    </div>
                    <div className={cn(
                        "flex-1 p-6 rounded-[24px] flex flex-col items-center border transition-all duration-500",
                        optimizations > 0 ? "bg-ai-accent/10 border-ai-accent/20 shadow-[0_10px_30px_rgba(139,92,246,0.15)]" : "bg-white/5 border-white/5"
                    )}>
                        <span className={cn("text-4xl font-black mb-1", optimizations > 0 ? "text-ai-accent" : "opacity-20")}>
                            {optimizations}
                        </span>
                        <span className="text-[10px] uppercase font-black tracking-widest opacity-60 text-center">Optimise</span>
                    </div>
                </div>
            </div>

            {/* AI Suggestions List */}
            <div className="p-8 space-y-8 flex-1 overflow-y-auto scrollbar-hide">
                <div className="space-y-6">
                    <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40 flex items-center gap-2">
                        <Brain className="w-4 h-4" /> Deep Insights {currentSuggestions.length > 0 && <span className="text-ai-accent">({currentSuggestions.length})</span>}
                    </h3>

                    {currentSuggestions.length === 0 ? (
                        <div className="p-12 text-center opacity-30 italic text-base border-2 border-dashed border-white/5 rounded-[32px]">
                            No insights detected for this module.
                        </div>
                    ) : (
                        currentSuggestions.map((s) => (
                            <div key={s.id} className={cn(
                                "p-6 rounded-[28px] border relative overflow-hidden group transition-all hover:translate-y-[-4px] active:scale-[0.98]",
                                s.type === 'security' ? "bg-risk-critical/5 border-risk-critical/20" : "bg-ai-accent/5 border-ai-accent/20"
                            )}>
                                <div className="flex items-start gap-5">
                                    <div className={cn(
                                        "p-3 rounded-2xl shrink-0",
                                        s.type === 'security' ? "bg-risk-critical/10 text-risk-critical" : "bg-ai-accent/10 text-ai-accent"
                                    )}>
                                        {s.type === 'security' ? (
                                            <AlertTriangle className="w-5 h-5" />
                                        ) : (
                                            <Lightbulb className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div className="space-y-3 flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Line {s.line}</span>
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-background/50 rounded-full border border-white/5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-ai-accent animate-pulse" />
                                                <span className="text-[10px] font-bold text-ai-accent">
                                                    {Math.round(s.confidence * 100)}% Match
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-base leading-relaxed font-semibold tracking-tight">
                                            {s.message}
                                        </p>
                                        {s.fix && (
                                            <div className="mt-4 p-4 bg-black/40 rounded-2xl font-mono border border-white/5 group-hover:border-ai-accent/30 transition-colors">
                                                <span className="opacity-40 tracking-tighter block mb-2 uppercase text-[9px] font-black">AI FIX ARCHITECTURE</span>
                                                <code className="text-xs text-ai-accent leading-relaxed">{s.fix}</code>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Subtle hover glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </div>
                        ))
                    )}
                </div>

                {/* Timeline */}
                <div className="space-y-6 pt-8 border-t border-white/5">
                    <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Activity Stream
                    </h3>
                    <div className="relative pl-6 space-y-8">
                        <div className="absolute left-[3px] top-2 bottom-2 w-[1px] bg-gradient-to-b from-ai-accent/50 via-border to-transparent" />
                        {[
                            { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), label: `Analysis Target: ${activeFile || 'No file selected'}`, active: false },
                            { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), label: 'Vector Scan Complete', active: true, color: 'text-ai-accent' },
                        ].map((item, i) => (
                            <div key={i} className="relative">
                                <div className={cn(
                                    "absolute -left-[27px] top-1.5 w-3 h-3 rounded-full border-2 border-background",
                                    item.active ? "bg-ai-accent shadow-[0_0_10px_rgba(139,92,246,0.6)]" : "bg-white/10"
                                )} />
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">{item.time}</span>
                                    <p className={cn("text-sm font-bold tracking-tight", item.color)}>{item.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Chat Input */}
            <div className="p-8 border-t border-white/5 bg-white/[0.01]">
                <label className="relative block group">
                    <input
                        type="text"
                        placeholder="Query the AI about this file..."
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:border-ai-accent transition-all shadow-inner placeholder:opacity-30 font-medium"
                    />
                    <div className="absolute right-4 top-3 p-2 rounded-xl bg-white/5 group-hover:bg-ai-accent/10 transition-colors">
                        <MessageSquare className="w-5 h-5 opacity-40 group-focus-within:text-ai-accent group-focus-within:opacity-100 transition-all" />
                    </div>
                </label>
            </div>
        </div>
    );
}
