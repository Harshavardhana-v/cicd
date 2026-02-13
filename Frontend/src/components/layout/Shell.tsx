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
                <div className="flex h-20 items-center px-10 border-b border-white/5 bg-sidebar/10 backdrop-blur-md justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setView('selection')}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors opacity-40 hover:opacity-100"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="h-6 w-[1px] bg-white/10" />
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-ai-accent animate-pulse shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                            <div className="flex items-center gap-2">
                                {repoOwner && (
                                    <>
                                        <span className="text-xs font-bold opacity-30 uppercase tracking-widest">{repoOwner}</span>
                                        <span className="text-xs opacity-20">/</span>
                                    </>
                                )}
                                <span className="text-xs text-foreground uppercase tracking-[0.3em] font-black">
                                    {selectedRepo || "Local Session"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] font-black opacity-30">code-sage.v2.4.0</span>
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
