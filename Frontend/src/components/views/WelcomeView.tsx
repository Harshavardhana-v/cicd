"use client";

import React from 'react';
import { useUIStore } from '@/store/useStore';
import { Brain, Zap, Shield, ChevronRight, Github, Code, Sparkles } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function WelcomeView() {
    const { setView, userName } = useUIStore();

    const features = [
        {
            icon: <Brain className="w-6 h-6 text-ai-accent" />,
            title: "Context-Aware AI",
            desc: "Go beyond syntax. CodeSage understands your logic and intent."
        },
        {
            icon: <Shield className="w-6 h-6 text-risk-safe" />,
            title: "Security Hardened",
            desc: "Owasp Top 10 and PII detection integrated into every scan."
        },
        {
            icon: <Zap className="w-6 h-6 text-risk-warning" />,
            title: "Zero Latency",
            desc: "Optimized for speed. Get code insights in under 200ms."
        }
    ];

    return (
        <div className="min-h-screen w-full bg-[#03060b] text-foreground flex flex-col items-center justify-center p-8 relative overflow-hidden font-sans">
            {/* Immersive Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-ai-accent/10 blur-[160px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[160px] rounded-full animate-pulse delay-1000" />
                <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] bg-ai-accent/5 blur-[120px] rounded-full animate-pulse delay-700" />
            </div>

            {/* Content Container */}
            <div className="w-full max-w-[1600px] flex flex-col items-center text-center space-y-16 relative z-10 transition-all duration-1000">

                {/* Hero Group */}
                <div className="space-y-8 max-w-5xl mx-auto">
                    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.03] border border-white/10 text-ai-accent text-[10px] font-black uppercase tracking-[0.4em] backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <Sparkles className="w-3.5 h-3.5" /> Intelligence v2.0
                    </div>

                    <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.95] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                        Build better code <br />
                        <span className="bg-gradient-to-r from-ai-accent via-indigo-400 to-ai-accent bg-[length:200%_auto] animate-gradient-mask bg-clip-text text-transparent italic px-2">with CodeSage</span>.
                    </h1>

                    <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto opacity-60 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                        The autonomous code review platform that understands <span className="text-foreground font-bold">intent</span>, <span className="text-foreground font-bold">context</span>, and <span className="text-foreground font-bold">performance</span> at scale.
                    </p>
                </div>

                {/* Main CTA */}
                <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                    <button
                        onClick={() => setView('selection')}
                        className="group relative px-14 py-7 bg-ai-accent hover:bg-ai-accent/90 text-white rounded-[32px] font-black text-2xl transition-all hover:scale-105 hover:shadow-[0_0_80px_rgba(139,92,246,0.4)] flex items-center gap-6 border-t border-white/20 active:scale-95 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <span>Get Started</span>
                        <ChevronRight className="w-7 h-7 group-hover:translate-x-2 transition-transform duration-500" />
                    </button>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20">No configuration required to start</div>
                </div>

                {/* Feature Grid - Enhanced for width */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-700">
                    {features.map((f, i) => (
                        <div key={i} className="group p-12 rounded-[48px] bg-white/[0.02] border border-white/5 backdrop-blur-2xl text-left hover:bg-white/[0.04] hover:border-ai-accent/20 transition-all duration-500">
                            <div className="mb-8 p-4 bg-white/5 w-16 h-16 rounded-[24px] flex items-center justify-center border border-white/5 group-hover:scale-110 group-hover:bg-ai-accent/10 transition-all duration-500">
                                {React.cloneElement(f.icon as React.ReactElement<any>, { className: "w-7 h-7 text-ai-accent" })}
                            </div>
                            <h3 className="text-3xl font-black mb-4 tracking-tight group-hover:text-ai-accent transition-colors">{f.title}</h3>
                            <p className="text-base text-muted-foreground leading-relaxed font-medium opacity-50 group-hover:opacity-80 transition-opacity">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Stats - To fill full screen space */}
            <div className="absolute bottom-12 w-full max-w-[1600px] flex justify-between px-10 opacity-20 text-[9px] font-black uppercase tracking-[0.5em] animate-in fade-in duration-1000 delay-1000">
                <span>Enterprise Ready</span>
                <span className="flex gap-8">
                    <span>Owasp L3 Compliance</span>
                    <span>Real-time Sync</span>
                </span>
            </div>
        </div>
    );
}
