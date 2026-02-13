"use client";

import React, { useEffect, useState } from 'react';
import { useUIStore } from '@/store/useStore';
import {
    ShieldAlert,
    FileText,
    CheckCircle2,
    ChevronLeft,
    ArrowRight,
    Zap,
    Loader2,
    AlertTriangle,
    Github,
    BarChart3,
    History,
    Activity
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function RepositoryAnalysisView() {
    const {
        setView,
        selectedRepo,
        repoOwner,
        prsCount,
        issuesCount,
        setRepoFiles,
        setRepoBranch,
        setPRsCount,
        setIssuesCount,
        setCodeToReview,
        setActiveFile,
        repoFiles
    } = useUIStore();

    const [loading, setLoading] = useState(true);
    const [scanData, setScanData] = useState<any>(null);

    useEffect(() => {
        const fetchDeepAnalysis = async () => {
            if (!selectedRepo || !repoOwner) return;

            try {
                // 1. Fetch real tree structure from backend
                const treeRes = await fetch(`http://localhost:5000/api/github/tree/${repoOwner}/${selectedRepo}`);
                const treeData = await treeRes.json();
                setRepoFiles(treeData.tree);
                setRepoBranch(treeData.branch);

                // 2. Trigger analysis scan on backend
                const scanRes = await fetch(`http://localhost:5000/api/analysis/scan`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        owner: repoOwner,
                        repo: selectedRepo,
                        tree: treeData.tree
                    })
                });
                const scanResult = await scanRes.json();
                setScanData(scanResult);
            } catch (err) {
                console.error("Analysis failed:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDeepAnalysis();
    }, [selectedRepo, repoOwner]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-1000">
                <div className="relative">
                    <div className="w-32 h-32 rounded-full border-b-2 border-ai-accent animate-spin" />
                    <Zap className="w-12 h-12 text-ai-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-black italic tracking-widest text-ai-accent">VIBRATING AT SCALE</h2>
                    <p className="text-muted-foreground font-mono text-sm opacity-50 uppercase tracking-[0.3em]">
                        Scanning {selectedRepo} internal structures...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-start relative px-10">
            <div className="w-full max-w-[1400px] space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pt-16 pb-24">

                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setView('github')}
                        className="flex items-center gap-3 text-sm font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all group"
                    >
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Go back to Dashboard
                    </button>
                    <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                        <Github className="w-5 h-5 opacity-40" />
                        <span className="text-sm font-black italic opacity-40">{repoOwner} / {selectedRepo}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Panel: Core Score */}
                    <div className="lg:col-span-4 space-y-10">
                        <div className="glass rounded-[48px] p-12 flex flex-col items-center text-center space-y-8 relative overflow-hidden shadow-2xl transition-all hover:border-ai-accent/30">
                            <div className="relative">
                                <svg className="w-48 h-48 -rotate-90">
                                    <circle
                                        cx="96"
                                        cy="96"
                                        r="88"
                                        className="fill-none stroke-white/5 stroke-[12px]"
                                    />
                                    <circle
                                        cx="96"
                                        cy="96"
                                        r="88"
                                        className="fill-none stroke-ai-accent stroke-[12px] opacity-100"
                                        strokeDasharray={552.92}
                                        strokeDashoffset={552.92 * (1 - scanData?.qualityScore / 100)}
                                        strokeLinecap="round"
                                        style={{ transition: 'stroke-dashoffset 2s cubic-bezier(0.23, 1, 0.32, 1)' }}
                                    />
                                </svg>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <span className="text-6xl font-black italic tracking-tighter">{scanData?.qualityScore}</span>
                                    <span className="text-xl opacity-30 font-bold">%</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl font-black uppercase tracking-widest">Global Risk Index</h3>
                                <p className="text-muted-foreground leading-relaxed font-medium">Your architectural integrity is within defined safe parameters.</p>
                            </div>
                            <div className="absolute -top-10 -right-10 opacity-[0.03]">
                                <ShieldAlert className="w-48 h-48" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white/5 rounded-3xl p-6 border border-white/5 text-center">
                                <span className="text-xs font-black uppercase tracking-widest opacity-30 block mb-2">Live PRs</span>
                                <span className="text-4xl font-black italic text-ai-accent">{prsCount}</span>
                            </div>
                            <div className="bg-white/5 rounded-3xl p-6 border border-white/5 text-center">
                                <span className="text-xs font-black uppercase tracking-widest opacity-30 block mb-2">Open Issues</span>
                                <span className="text-4xl font-black italic text-risk-warning">{issuesCount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Deep Insights */}
                    <div className="lg:col-span-8 space-y-10">
                        <h2 className="text-4xl font-black tracking-tight italic flex items-center gap-4">
                            <Activity className="w-10 h-10 text-ai-accent" /> Analysis Breakdown
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Security Vulnerabilities */}
                            <div className="glass rounded-[40px] p-8 space-y-6 flex flex-col border-l-4 border-l-risk-critical">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-black uppercase tracking-widest text-sm opacity-50 flex items-center gap-3">
                                        <ShieldAlert className="w-5 h-5 text-risk-critical" /> Security Risks
                                    </h4>
                                    <span className="px-3 py-1 bg-risk-critical/10 text-risk-critical rounded-full text-[10px] font-black">
                                        {scanData?.vulnerabilities.length} DETECTED
                                    </span>
                                </div>
                                <div className="flex-1 space-y-4">
                                    {scanData?.vulnerabilities.length > 0 ? (
                                        scanData.vulnerabilities.map((v: any, i: number) => (
                                            <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 text-sm font-medium">
                                                <span className="text-risk-critical font-black mr-2">[{v.severity}]</span> {v.message}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex items-center gap-3 text-muted-foreground opacity-50 italic">
                                            <CheckCircle2 className="w-5 h-5 text-risk-safe" /> No critical vulnerabilities detected
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Guideline Violations */}
                            <div className="glass rounded-[40px] p-8 space-y-6 flex flex-col border-l-4 border-l-risk-warning">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-black uppercase tracking-widest text-sm opacity-50 flex items-center gap-3">
                                        <AlertTriangle className="w-5 h-5 text-risk-warning" /> Policy Compliance
                                    </h4>
                                    <span className="px-3 py-1 bg-risk-warning/10 text-risk-warning rounded-full text-[10px] font-black">
                                        {scanData?.guidelineViolations.length} VIOLATIONS
                                    </span>
                                </div>
                                <div className="flex-1 space-y-4">
                                    {scanData?.guidelineViolations.map((v: string, i: number) => (
                                        <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 text-sm font-medium">
                                            {v}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Documentation Defects */}
                            <div className="glass rounded-[40px] p-8 space-y-6 flex flex-col border-l-4 border-l-ai-accent">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-black uppercase tracking-widest text-sm opacity-50 flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-ai-accent" /> Documentation
                                    </h4>
                                </div>
                                <div className="flex-1 space-y-4">
                                    {scanData?.docErrors.map((v: string, i: number) => (
                                        <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 text-sm font-medium">
                                            {v}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* PR Impact Analysis */}
                            <div className="glass rounded-[40px] p-8 space-y-6 flex flex-col border-l-4 border-l-risk-safe">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-black uppercase tracking-widest text-sm opacity-50 flex items-center gap-3">
                                        <History className="w-5 h-5 text-risk-safe" /> PR Impact Analysis
                                    </h4>
                                    <span className="text-xl font-black italic tracking-tighter text-risk-safe">
                                        {scanData?.prImpact.score}% <span className="text-[10px] opacity-30 mt-1">HEALTH</span>
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                                    {scanData?.prImpact.summary}
                                </p>
                            </div>
                        </div>

                        <div className="pt-10 flex items-center justify-end border-t border-white/5 mt-6">
                            <button
                                onClick={async () => {
                                    // Auto-select the first meaningful file (README.md or first src file)
                                    const firstFile = repoFiles.find(f =>
                                        f.type === 'blob' && (f.path.toLowerCase().includes('readme.md') || f.path.startsWith('src/'))
                                    ) || repoFiles.find(f => f.type === 'blob');

                                    if (firstFile) {
                                        setActiveFile(firstFile.path);
                                        const branch = useUIStore.getState().repoBranch || 'main';
                                        const rawUrl = `https://raw.githubusercontent.com/${repoOwner}/${selectedRepo}/${branch}/${firstFile.path}`;

                                        try {
                                            const res = await fetch(rawUrl);
                                            if (res.ok) {
                                                const content = await res.text();
                                                setCodeToReview(content);
                                            }
                                        } catch (e) {
                                            console.error("Auto-fetch failed", e);
                                        }
                                    }

                                    setView('review');
                                }}
                                className="px-12 py-5 bg-ai-accent rounded-[32px] text-white font-black text-xl flex items-center gap-4 hover:scale-105 transition-all shadow-[0_20px_60px_rgba(139,92,246,0.5)] active:scale-95 group"
                            >
                                START DEEP CODE REVIEW
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
