"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, FileCode, GitPullRequest, Shield, Zap, Navigation, Settings, Folder } from 'lucide-react';
import { useUIStore } from '@/store/useStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface PaletteCommand {
    id: string;
    group: string;
    icon: React.ReactNode;
    label: string;
    sublabel?: string;
    shortcut?: string;
    action: () => void;
}

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const {
        setActiveFile,
        setView,
        setSelectedPR,
        repoFiles,
        repoOwner,
        selectedRepo,
        repoBranch,
        setCodeToReview,
        isPrivacyMode,
        setPrivacyMode,
        focusMode,
        setFocusMode
    } = useUIStore();

    // ── Static commands ──────────────────────────────────────────
    const staticCommands: PaletteCommand[] = [
        {
            id: 'action-privacy',
            group: 'System',
            icon: isPrivacyMode ? <Shield className="w-4 h-4 text-risk-critical" /> : <Shield className="w-4 h-4 opacity-30" />,
            label: isPrivacyMode ? 'Disable Privacy Mode' : 'Enable Privacy Mode',
            sublabel: 'Blur/Unblur sensitive code content',
            action: () => setPrivacyMode(!isPrivacyMode),
        },
        {
            id: 'nav-review',
            group: 'Navigation',
            icon: focusMode === 'review' ? <Navigation className="w-4 h-4 text-ai-accent" /> : <Navigation className="w-4 h-4" />,
            label: 'Switch to Review Mode',
            sublabel: 'Standard code editor view',
            action: () => {
                setView('review');
                setFocusMode('review');
            },
        },
        {
            id: 'nav-analysis',
            group: 'Navigation',
            icon: focusMode === 'analysis' ? <Navigation className="w-4 h-4 text-ai-accent" /> : <Navigation className="w-4 h-4" />,
            label: 'Switch to Analysis Mode',
            sublabel: 'Interactive dependency graph viewer',
            action: () => {
                setView('review'); // Ensuring we are in the main shell
                setFocusMode('analysis');
            },
        },
        {
            id: 'action-security',
            group: 'Filters',
            icon: <Shield className="w-4 h-4 text-risk-critical" />,
            label: 'Filter: Security Risks',
            sublabel: 'Show only critical vulnerabilities',
            shortcut: ':security',
            action: () => {
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('codesage:filter', { detail: 'security' }));
                }
            },
        },
        {
            id: 'action-optimization',
            group: 'Filters',
            icon: <Zap className="w-4 h-4 text-ai-accent" />,
            label: 'Filter: Optimizations',
            sublabel: 'Show logic & performance tips',
            shortcut: ':opt',
            action: () => {
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('codesage:filter', { detail: 'optimization' }));
                }
            },
        },
        {
            id: 'action-showAll',
            group: 'Filters',
            icon: <Settings className="w-4 h-4" />,
            label: 'Clear All Filters',
            sublabel: 'Show all intelligence insights',
            action: () => {
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('codesage:filter', { detail: 'all' }));
                }
            },
        },
    ];

    // ── File commands from real repo tree ────────────────────────
    const fileCommands: PaletteCommand[] = (repoFiles || [])
        .filter(f => f.type === 'blob')
        .slice(0, 80)
        .map(f => ({
            id: `file-${f.path}`,
            group: 'Files',
            icon: f.path.includes('/') ? <FileCode className="w-4 h-4" /> : <Folder className="w-4 h-4" />,
            label: f.path.split('/').pop() || f.path,
            sublabel: f.path,
            action: async () => {
                setActiveFile(f.path);
                const branch = repoBranch || 'main';
                const rawUrl = `https://raw.githubusercontent.com/${repoOwner}/${selectedRepo}/${branch}/${f.path}`;
                try {
                    const res = await fetch(rawUrl);
                    if (res.ok) setCodeToReview(await res.text());
                } catch { /* silent */ }
                setView('review');
            },
        }));

    const allCommands = [...staticCommands, ...fileCommands];

    // ── Filtering ─────────────────────────────────────────────────
    const filtered = query.trim()
        ? (() => {
            const lowQuery = query.toLowerCase();
            let base = allCommands.filter(c =>
                c.label.toLowerCase().includes(lowQuery) ||
                (c.sublabel || '').toLowerCase().includes(lowQuery)
            );

            // Add intelligent overlays
            if (lowQuery.includes('security') || lowQuery.includes('vulnerab') || lowQuery.includes('risk')) {
                base.unshift({
                    id: 'smart-security',
                    group: '💫 Smart Action',
                    icon: <Shield className="w-4 h-4 text-risk-critical animate-pulse" />,
                    label: 'Run Deep Security Audit',
                    sublabel: 'Force re-scan current buffer for high-risk patterns',
                    action: () => window.dispatchEvent(new CustomEvent('codesage:filter', { detail: 'security' })),
                });
            }
            if (lowQuery.includes('optimize') || lowQuery.includes('perf') || lowQuery.includes('fast')) {
                base.unshift({
                    id: 'smart-opt',
                    group: '💫 Smart Action',
                    icon: <Zap className="w-4 h-4 text-emerald-400 animate-bounce" />,
                    label: 'Analyze Performance Bottlenecks',
                    sublabel: 'Identify unoptimized loops and memory leaks',
                    action: () => window.dispatchEvent(new CustomEvent('codesage:filter', { detail: 'optimization' })),
                });
            }

            return base;
        })()
        : staticCommands; // Only show static when no query typed

    // Group results
    const grouped = filtered.reduce<Record<string, PaletteCommand[]>>((acc, cmd) => {
        if (!acc[cmd.group]) acc[cmd.group] = [];
        acc[cmd.group].push(cmd);
        return acc;
    }, {});

    const flatFiltered = Object.values(grouped).flat();

    // ── Keyboard: open/close ──────────────────────────────────────
    const handleGlobalKeyDown = useCallback((e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setIsOpen(prev => !prev);
        }
        if (e.key === 'Escape') setIsOpen(false);
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [handleGlobalKeyDown]);

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // ── Keyboard: navigate list ────────────────────────────────────
    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(i => Math.min(i + 1, flatFiltered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const cmd = flatFiltered[selectedIndex];
            if (cmd) executeCommand(cmd);
        }
    };

    // Reset selection on query change
    useEffect(() => setSelectedIndex(0), [query]);

    // Scroll selected into view
    useEffect(() => {
        const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
        el?.scrollIntoView({ block: 'nearest' });
    }, [selectedIndex]);

    const executeCommand = (cmd: PaletteCommand) => {
        cmd.action();
        setIsOpen(false);
        setQuery('');
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
            onClick={() => setIsOpen(false)}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div
                className="relative w-full max-w-2xl bg-[#0a0f1d] border border-white/10 rounded-2xl shadow-[0_40px_120px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                onClick={e => e.stopPropagation()}
            >
                {/* Search Input */}
                <div className="flex items-center px-5 border-b border-white/5 bg-white/[0.02]">
                    <Search className="w-4 h-4 opacity-30 mr-4 flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search files, commands, actions..."
                        className="w-full h-14 bg-transparent text-sm focus:outline-none text-foreground placeholder:opacity-20 font-medium"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleInputKeyDown}
                    />
                    <kbd className="hidden sm:flex items-center px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] font-mono opacity-50 flex-shrink-0">
                        ESC
                    </kbd>
                </div>

                {/* Results */}
                <div ref={listRef} className="max-h-[420px] overflow-y-auto p-3 space-y-1">
                    {flatFiltered.length === 0 ? (
                        <div className="py-12 text-center opacity-30 text-sm italic">
                            No results for "{query}"
                        </div>
                    ) : (
                        Object.entries(grouped).map(([group, cmds]) => (
                            <div key={group} className="mb-3">
                                <p className="px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] opacity-25 text-foreground">
                                    {group}
                                </p>
                                {cmds.map(cmd => {
                                    const idx = flatFiltered.indexOf(cmd);
                                    const isSelected = idx === selectedIndex;
                                    return (
                                        <button
                                            key={cmd.id}
                                            data-index={idx}
                                            onClick={() => executeCommand(cmd)}
                                            className={cn(
                                                "w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all group",
                                                isSelected
                                                    ? "bg-ai-accent/15 border border-ai-accent/30"
                                                    : " hover:bg-white/5 border border-transparent"
                                            )}
                                        >
                                            <div className={cn(
                                                "transition-opacity flex-shrink-0",
                                                isSelected ? "opacity-100 text-ai-accent" : "opacity-30 group-hover:opacity-70"
                                            )}>
                                                {cmd.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={cn(
                                                    "text-sm font-semibold truncate",
                                                    isSelected ? "text-foreground" : "opacity-70"
                                                )}>
                                                    {cmd.label}
                                                </p>
                                                {cmd.sublabel && (
                                                    <p className="text-[10px] opacity-30 truncate font-mono mt-0.5">
                                                        {cmd.sublabel}
                                                    </p>
                                                )}
                                            </div>
                                            {cmd.shortcut && (
                                                <kbd className="hidden sm:block text-[9px] px-1.5 py-0.5 bg-white/5 border border-white/10 rounded font-mono opacity-40">
                                                    {cmd.shortcut}
                                                </kbd>
                                            )}
                                            {isSelected && (
                                                <kbd className="text-[9px] px-1.5 py-0.5 bg-ai-accent/20 border border-ai-accent/30 rounded font-mono text-ai-accent">
                                                    ↵
                                                </kbd>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-white/5 bg-black/30 flex items-center justify-between">
                    <span className="text-[9px] opacity-20 font-black uppercase tracking-[0.2em]">
                        CODESAGE COMMAND PALETTE
                    </span>
                    <div className="flex gap-4">
                        {[['↑↓', 'Navigate'], ['↵', 'Select'], ['ESC', 'Close']].map(([key, label]) => (
                            <span key={key} className="text-[9px] opacity-30 flex items-center gap-1">
                                <kbd className="px-1 py-0.5 bg-white/5 border border-white/10 rounded font-mono">{key}</kbd>
                                {label}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
