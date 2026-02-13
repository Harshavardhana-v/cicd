"use client";

import React, { useState } from 'react';
import { useUIStore } from '@/store/useStore';
import { Terminal, Copy, ArrowRight, CornerDownLeft, Sparkles, ChevronLeft, Github } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const SAMPLE_CODE = `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    // Potential vulnerability: unvalidated input access
    total += items[i].price;
  }
  return total;
}

// Logic flaw: missing empty array check
console.log(calculateTotal([]));`;

export default function SelectionView() {
    const { setView, setCodeToReview } = useUIStore();
    const [inputCode, setInputCode] = useState('');

    const handleStartReview = (code?: string) => {
        const finalCode = code || inputCode;
        if (finalCode.trim().length > 0) {
            setCodeToReview(finalCode);
            setView('review');
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center relative px-10">
            <div className="w-full max-w-[1400px] space-y-12 relative z-10 animate-in fade-in duration-700">

                <button
                    onClick={() => setView('welcome')}
                    className="flex items-center gap-2 text-sm opacity-50 hover:opacity-100 transition-opacity"
                >
                    <ChevronLeft className="w-4 h-4" /> Back to home
                </button>

                <div className="space-y-4 text-center md:text-left">
                    <h2 className="text-5xl font-black tracking-tight leading-tight">Choose your <span className="text-ai-accent italic underline decoration-ai-accent/30 underline-offset-8">entry point</span>.</h2>
                    <p className="text-xl text-muted-foreground font-medium">Kickstart your code intelligence session via direct input or profile sync.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-16 items-stretch">
                    {/* Left: Direct Input */}
                    <div className="flex flex-col space-y-6">
                        <div className="relative group flex-1 flex flex-col">
                            <div className="absolute -inset-1 bg-gradient-to-r from-ai-accent via-indigo-500 to-ai-accent rounded-[40px] blur opacity-10 group-hover:opacity-30 transition duration-1000"></div>
                            <div className="relative flex-1 flex flex-col bg-sidebar/50 backdrop-blur-3xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
                                <div className="flex items-center justify-between px-8 py-5 bg-white/5 border-b border-white/5">
                                    <span className="text-xs font-black uppercase tracking-[0.2em] opacity-60 flex items-center gap-2">
                                        <Terminal className="w-4 h-4 text-ai-accent" /> Editor Terminal
                                    </span>
                                </div>
                                <textarea
                                    placeholder="Paste your source code here to start analysis..."
                                    className="flex-1 w-full min-h-[450px] bg-transparent p-8 text-lg font-mono focus:outline-none resize-none placeholder:opacity-30 leading-relaxed scrollbar-hide"
                                    value={inputCode}
                                    onChange={(e) => setInputCode(e.target.value)}
                                />
                                <div className="p-8 border-t border-white/5 flex items-center justify-between bg-white/[0.02]">
                                    <div className="flex items-center gap-2 text-[10px] opacity-40 uppercase font-black tracking-widest hidden lg:flex">
                                        <CornerDownLeft className="w-4 h-4" /> Press Cmd+Enter to launch
                                    </div>
                                    <button
                                        disabled={!inputCode.trim()}
                                        onClick={() => handleStartReview()}
                                        className="px-10 py-4 bg-ai-accent hover:bg-ai-accent/90 disabled:opacity-20 text-white rounded-2xl font-black text-base transition-all hover:scale-105 active:scale-95 flex items-center gap-3 shadow-[0_10px_30px_rgba(139,92,246,0.3)]"
                                    >
                                        Launch Session <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Samples & Features */}
                    <div className="flex flex-col space-y-8">
                        <div
                            onClick={() => handleStartReview(SAMPLE_CODE)}
                            className="p-10 rounded-[32px] bg-sidebar/30 border border-border border-dashed hover:border-ai-accent/50 hover:bg-ai-accent/5 transition-all cursor-pointer group flex flex-col justify-between min-h-[220px]"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="p-3 rounded-2xl bg-risk-safe/10 text-risk-safe border border-risk-safe/20 shadow-inner">
                                        <Sparkles className="w-6 h-6" />
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] bg-risk-safe/10 text-risk-safe px-3 py-1.5 rounded-full border border-risk-safe/20">Explorer Mode</span>
                                </div>
                                <h3 className="text-3xl font-black mb-3">Try Example Code</h3>
                                <p className="text-lg text-muted-foreground font-medium italic opacity-70 leading-relaxed">"Quickly visualize how CodeSage flags vulnerabilities in real-world JavaScript snippets."</p>
                            </div>
                            <div className="text-base font-black text-ai-accent flex items-center gap-2 group-hover:gap-4 transition-all pt-6">
                                Load Sample Snippet <ArrowRight className="w-5 h-5" />
                            </div>
                        </div>

                        <div
                            onClick={() => setView('github')}
                            className="p-10 rounded-[32px] bg-sidebar/50 border border-white/10 hover:border-ai-accent/50 hover:bg-ai-accent/5 transition-all cursor-pointer group flex flex-col justify-between min-h-[220px] shadow-xl"
                        >
                            <div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 rounded-2xl bg-ai-accent/10 text-ai-accent border border-ai-accent/20">
                                        <Github className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-3xl font-black tracking-tight">GitHub Sync</h3>
                                </div>
                                <p className="text-lg text-muted-foreground font-medium leading-relaxed opacity-70">Connect your cloud profiles to monitor live repositories and perform automated deep scans on every commit.</p>
                            </div>
                            <div className="text-base font-black text-ai-accent flex items-center gap-2 group-hover:gap-4 transition-all pt-6">
                                Integrate Account <ArrowRight className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
