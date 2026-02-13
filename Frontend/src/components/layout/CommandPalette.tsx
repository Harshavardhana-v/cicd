"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Command, FileText, Settings, Shield, Zap } from 'lucide-react';
import { useUIStore } from '@/store/useStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const { setActiveFile } = useUIStore();

    const commands = [
        { id: '1', icon: <FileText className="w-4 h-4" />, label: 'Open page.tsx', action: () => setActiveFile('src/app/page.tsx') },
        { id: '2', icon: <Shield className="w-4 h-4" />, label: 'Run Security Scan', action: () => console.log('Scanning...') },
        { id: '3', icon: <Zap className="w-4 h-4" />, label: 'Optimize Bundle', action: () => console.log('Optimizing...') },
        { id: '4', icon: <Settings className="w-4 h-4" />, label: 'Settings', action: () => console.log('Settings...') },
    ];

    const filteredCommands = commands.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase())
    );

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setIsOpen(prev => !prev);
        }
        if (e.key === 'Escape') {
            setIsOpen(false);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 backdrop-blur-sm bg-black/40">
            <div className="w-full max-w-xl bg-sidebar border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center px-4 border-b border-border bg-sidebar/50">
                    <Search className="w-4 h-4 opacity-40 mr-3" />
                    <input
                        autoFocus
                        type="text"
                        placeholder="Type a command or search files..."
                        className="w-full h-12 bg-transparent text-sm focus:outline-none"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 bg-border rounded text-[10px] font-mono opacity-50">
                        ESC
                    </kbd>
                </div>

                <div className="max-h-[300px] overflow-y-auto p-2">
                    {filteredCommands.length === 0 ? (
                        <div className="p-4 text-center opacity-40 text-sm italic">No results found.</div>
                    ) : (
                        filteredCommands.map((cmd) => (
                            <button
                                key={cmd.id}
                                onClick={() => {
                                    cmd.action();
                                    setIsOpen(false);
                                    setQuery('');
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 text-sm text-left transition-colors group"
                            >
                                <div className="opacity-40 group-hover:opacity-100 transition-opacity">
                                    {cmd.icon}
                                </div>
                                <span className="flex-1 font-medium">{cmd.label}</span>
                                <Command className="w-3 h-3 opacity-20 group-hover:opacity-100 transition-opacity" />
                            </button>
                        ))
                    )}
                </div>

                <div className="px-4 py-2 border-t border-border bg-sidebar/30 flex items-center justify-between">
                    <span className="text-[10px] opacity-40 font-medium">CODESAGE COMMAND PALETTE</span>
                    <div className="flex gap-4">
                        <span className="text-[10px] opacity-40 flex items-center gap-1">
                            <kbd className="px-1 bg-border rounded">↵</kbd> Select
                        </span>
                        <span className="text-[10px] opacity-40 flex items-center gap-1">
                            <kbd className="px-1 bg-border rounded">↑↓</kbd> Navigate
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
