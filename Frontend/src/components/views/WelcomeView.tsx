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
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Animated Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-ai-accent/20 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-risk-safe/10 blur-[120px] rounded-full animate-pulse delay-700" />

            {/* Hero Section */}
            <div className="w-full max-w-[1400px] text-center space-y-12 relative z-10 py-20">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ai-accent/10 border border-ai-accent/20 text-ai-accent text-xs font-bold uppercase tracking-[0.2em] animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <Sparkles className="w-4 h-4 ml-[-4px]" /> Intelligence v2.0
                </div>

                <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                    Build better code <br />
                    with <span className="bg-gradient-to-r from-ai-accent via-indigo-400 to-ai-accent bg-[length:200%_auto] animate-gradient-mask bg-clip-text text-transparent italic">CodeSage</span>.
                </h1>

                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto opacity-80 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                    The autonomous code review platform that understands <span className="text-foreground">intent</span>, <span className="text-foreground">context</span>, and <span className="text-foreground">performance</span> at scale.
                </p>

                {/* Action Button */}
                <div className="pt-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                    <button
                        onClick={() => setView('selection')}
                        className="group relative px-10 py-5 bg-ai-accent hover:bg-ai-accent/90 text-white rounded-[24px] font-black text-lg transition-all hover:scale-105 hover:shadow-[0_20px_50px_rgba(139,92,246,0.5)] flex items-center gap-3 mx-auto border-t border-white/20 active:scale-95"
                    >
                        Get Started <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Feature Grid */}
                <div className="grid md:grid-cols-3 gap-10 pt-32 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700">
                    {features.map((f, i) => (
                        <div key={i} className="p-10 rounded-[32px] bg-sidebar/20 border border-border/50 backdrop-blur-md text-left hover:border-ai-accent/30 transition-all group hover:bg-sidebar/40">
                            <div className="mb-6 group-hover:scale-110 transition-transform origin-left bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5">{f.icon}</div>
                            <h3 className="text-2xl font-extrabold mb-3 tracking-tight">{f.title}</h3>
                            <p className="text-base text-muted-foreground leading-relaxed font-medium">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
