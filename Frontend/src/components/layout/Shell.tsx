"use client";

import React, { Suspense, lazy } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2, Shield, ShieldOff, Target } from 'lucide-react';
import { useUIStore } from '@/store/useStore';
import CommandPalette from './CommandPalette';
import PresenceIndicators from '../ui/PresenceIndicators';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ShellProps {
    zoneA: React.ReactNode;
    zoneB: React.ReactNode;
    zoneC: React.ReactNode;
}

const ASTViewer = lazy(() => import('../views/ASTViewer'));
const IntelligencePanel = lazy(() => import('../panel/IntelligencePanel'));

export default function Shell({ zoneA, zoneB, zoneC }: ShellProps) {
    const {
        isZoneAExpanded,
        toggleZoneA,
        isZoneCExpanded,
        toggleZoneC,
        selectedRepo,
        repoOwner,
        focusMode,
        setFocusMode,
        prsCount,
        issuesCount,
        isPrivacyMode,
        setPrivacyMode,
        isMacroView,
        setMacroView
    } = useUIStore();

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                toggleZoneA();
            }
            if ((e.metaKey || e.ctrlKey) && (e.key === '\\' || e.key === '|')) {
                e.preventDefault();
                toggleZoneC();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleZoneA, toggleZoneC]);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
            <CommandPalette />

            {/* Sidebar */}
            <aside className={cn(
                "relative flex flex-col border-r border-white/5 bg-sidebar/20",
                isZoneAExpanded ? "w-[340px]" : "w-[80px]"
            )}>
                <div className="flex h-20 items-center justify-between px-8 border-b border-white/5">
                    {isZoneAExpanded && (
                        <span className="text-xs font-black uppercase tracking-[0.2em] opacity-40">
                            Navigator
                        </span>
                    )}
                    <button onClick={toggleZoneA} className="p-2 rounded-xl opacity-40">
                        {isZoneAExpanded ? "←" : "→"}
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto py-6">
                    {zoneA}
                </div>
            </aside>

            {/* Editor */}
            <main className="flex-1 flex flex-col min-w-0 bg-background relative">
                <div className="h-24 px-8 border-b border-white/5 flex items-center justify-between gap-8">

                    {/* Repo info */}
                    <div className="flex-1 flex items-center gap-6 min-w-0">
                        <div className="flex items-center gap-4 flex-shrink-0">
                            <div className="w-2.5 h-2.5 rounded-full bg-ai-accent" />
                            <div className="flex flex-col">
                                {repoOwner && (
                                    <span className="text-[10px] opacity-30 uppercase tracking-widest">
                                        {repoOwner}
                                    </span>
                                )}
                                <span className="text-sm uppercase tracking-[0.2em] font-black truncate max-w-[120px]">
                                    {selectedRepo || "Local Session"}
                                </span>
                            </div>
                        </div>

                        {selectedRepo && (
                            <div className="flex items-center gap-6">
                                <div className="flex gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-ai-accent">{prsCount}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-risk-warning">{issuesCount}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Focus buttons */}
                    <div className="flex items-center gap-2 bg-black/40 p-1 rounded-full border border-white/5">
                        <button
                            onClick={() => setFocusMode('review')}
                            className={cn(
                                "px-5 py-2 rounded-full text-[11px] font-black uppercase",
                                focusMode === 'review' ? "bg-foreground text-background" : "opacity-50"
                            )}
                        >
                            Review
                        </button>
                        <button
                            onClick={() => setFocusMode('analysis')}
                            className={cn(
                                "px-5 py-2 rounded-full text-[11px] font-black uppercase",
                                focusMode === 'analysis' ? "bg-ai-accent text-white" : "opacity-50"
                            )}
                        >
                            Analysis
                        </button>
                    </div>

                    {/* Right section */}
                    <div className="flex items-center gap-6">
                        <div className="hidden xl:flex items-center gap-2 bg-white/[0.02] border border-white/5 p-1 rounded-2xl">
                            <button
                                onClick={() => setPrivacyMode(!isPrivacyMode)}
                                className={cn(
                                    "px-4 py-2 rounded-xl flex items-center gap-2 transition-all",
                                    isPrivacyMode ? "bg-risk-critical/10 text-risk-critical border border-risk-critical/20" : "hover:bg-white/5"
                                )}
                            >
                                {isPrivacyMode ? <Shield className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                                <span className="text-[9px] font-black uppercase tracking-widest">
                                    {isPrivacyMode ? "Privacy On" : "Privacy Off"}
                                </span>
                            </button>

                            <button
                                onClick={() => setMacroView(!isMacroView)}
                                className={cn(
                                    "px-4 py-2 rounded-xl flex items-center gap-2 transition-all",
                                    isMacroView ? "bg-ai-accent/10 text-ai-accent border border-ai-accent/20" : "hover:bg-white/5"
                                )}
                            >
                                <Target className={cn("w-3.5 h-3.5", isMacroView && "animate-pulse")} />
                                <span className="text-[9px] font-black uppercase tracking-widest">
                                    {isMacroView ? "Macro View" : "Code View"}
                                </span>
                            </button>
                        </div>

                        <div className="h-8 w-[1px] bg-white/5" />

                        <PresenceIndicators />

                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black opacity-30 uppercase tracking-widest">System Live</span>
                        </div>
                    </div>
                </div>

                {/* Editor body */}
                <div className="flex-1 overflow-hidden relative">
                    {focusMode === 'analysis' ? (
                        <Suspense fallback={
                            <div className="h-full w-full flex flex-col items-center justify-center bg-[#050a14] gap-4">
                                <Loader2 className="w-10 h-10 text-ai-accent opacity-20" />
                                <span className="text-[10px] uppercase opacity-20">
                                    Loading Graph...
                                </span>
                            </div>
                        }>
                            <ASTViewer />
                        </Suspense>
                    ) : zoneB}
                </div>
            </main>

            {/* Right panel */}
            <aside className={cn(
                "relative flex flex-col border-l border-white/5 bg-sidebar/40",
                isZoneCExpanded ? "w-[440px]" : "w-[80px]"
            )}>
                <div className="flex h-20 items-center justify-between px-8 border-b border-white/5">
                    <button onClick={toggleZoneC} className="p-2 rounded-xl opacity-40">
                        {isZoneCExpanded ? "→" : "←"}
                    </button>
                    {isZoneCExpanded && (
                        <span className="text-xs font-black uppercase tracking-[0.2em] opacity-40">
                            Intelligence
                        </span>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto">
                    <Suspense fallback={<div className="h-full w-full bg-[#050a14]" />}>
                        {zoneC}
                    </Suspense>
                </div>
            </aside>
        </div>
    );
}