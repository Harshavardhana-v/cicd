"use client";

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronLeft } from 'lucide-react';
import { useUIStore } from '@/store/useStore';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ShellProps {
    zoneA: React.ReactNode;
    zoneB: React.ReactNode;
    zoneC: React.ReactNode;
}

import CommandPalette from './CommandPalette';

export default function Shell({ zoneA, zoneB, zoneC }: ShellProps) {
    const { isZoneAExpanded, toggleZoneA, isZoneCExpanded, toggleZoneC, selectedRepo, repoOwner, setView } = useUIStore();

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background text-foreground selection:bg-ai-accent/30">
            <CommandPalette />
            {/* Zone A: Sidebar */}
            <aside
                className={cn(
                    "relative flex flex-col border-r border-white/5 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] bg-sidebar/20 backdrop-blur-3xl",
                    isZoneAExpanded ? "w-[340px]" : "w-[80px]"
                )}
            >
                <div className="flex h-20 items-center justify-between px-8 border-b border-white/5">
                    {isZoneAExpanded && <span className="text-xs font-black uppercase tracking-[0.2em] opacity-40">Navigator</span>}
                    <button
                        onClick={toggleZoneA}
                        className="p-2 hover:bg-white/5 rounded-xl transition-colors opacity-40 hover:opacity-100"
                    >
                        {isZoneAExpanded ? "←" : "→"}
                    </button>
                </div>
                <div className={cn("flex-1 overflow-y-auto scrollbar-hide py-6", !isZoneAExpanded && "items-center")}>
                    {zoneA}
                </div>
            </aside>

            {/* Zone B: Editor Stage */}
            <main className="flex-1 flex flex-col min-w-0 bg-background/50 relative">
                <div className="h-24 px-8 border-b border-white/5 bg-sidebar/10 backdrop-blur-md grid grid-cols-3 items-center relative z-50">
                    {/* Left: Repo Context */}
                    <div className="flex items-center justify-start gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-2.5 h-2.5 rounded-full bg-ai-accent animate-pulse shadow-[0_0_15px_rgba(139,92,246,0.6)]" />
                            <div className="flex flex-col">
                                {repoOwner && (
                                    <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest leading-none mb-1">{repoOwner}</span>
                                )}
                                <span className="text-sm text-foreground uppercase tracking-[0.2em] font-black leading-none">
                                    {selectedRepo || "Local Session"}
                                </span>
                            </div>
                        </div>

                        {selectedRepo && (
                            <>
                                <div className="h-8 w-[1px] bg-white/5" />
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-30 leading-tight">Active PRs</span>
                                        <span className="text-xs font-black italic text-ai-accent">{useUIStore.getState().prsCount}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-30 leading-tight">Issues</span>
                                        <span className="text-xs font-black italic text-risk-warning">{useUIStore.getState().issuesCount}</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Center: Focus Mode Switcher */}
                    <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-full border border-white/5 shadow-2xl backdrop-blur-xl">
                            <button
                                onClick={() => useUIStore.getState().setFocusMode('review')}
                                className={cn(
                                    "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300",
                                    useUIStore.getState().focusMode === 'review'
                                        ? "bg-foreground text-background shadow-lg scale-105"
                                        : "hover:bg-white/5 opacity-40 hover:opacity-100"
                                )}
                            >
                                Review
                            </button>
                            <button
                                onClick={() => useUIStore.getState().setFocusMode('analysis')}
                                className={cn(
                                    "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300",
                                    useUIStore.getState().focusMode === 'analysis'
                                        ? "bg-ai-accent text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] scale-105"
                                        : "hover:bg-white/5 opacity-40 hover:opacity-100"
                                )}
                            >
                                Analysis
                            </button>
                        </div>
                    </div>

                    {/* Right: Version & Meta */}
                    <div className="flex items-center justify-end gap-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[9px] font-medium opacity-50 uppercase tracking-wider">System Online</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] font-black opacity-20">code-sage.v2.4.6</span>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden">
                    {zoneB}
                </div>
            </main>

            {/* Zone C: Intelligence Panel */}
            <aside
                className={cn(
                    "relative flex flex-col border-l border-white/5 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] bg-sidebar/20 backdrop-blur-3xl",
                    isZoneCExpanded ? "w-[440px]" : "w-[80px]"
                )}
            >
                <div className="flex h-20 items-center justify-between px-8 border-b border-white/5">
                    <button
                        onClick={toggleZoneC}
                        className="p-2 hover:bg-white/5 rounded-xl transition-colors opacity-40 hover:opacity-100"
                    >
                        {isZoneCExpanded ? "→" : "←"}
                    </button>
                    {isZoneCExpanded && <span className="text-xs font-black uppercase tracking-[0.2em] opacity-40">Intelligence</span>}
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {zoneC}
                </div>
            </aside>
        </div>
    );
}
