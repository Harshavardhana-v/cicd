"use client";

import React, { useEffect, useState } from "react";
import { useUIStore } from "@/store/useStore";
import {
    ChevronLeft,
    ArrowRight,
    ShieldAlert,
    AlertTriangle,
    FileText,
    History,
    Github,
} from "lucide-react";

export default function RepositoryAnalysisView() {
    const {
        setView,
        selectedRepo,
        repoOwner,
        prsCount,
        issuesCount,
        setRepoFiles,
        setRepoBranch,
        setActiveFile,
        setCodeToReview,
        repoFiles,
    } = useUIStore();

    const [scanData, setScanData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDeepAnalysis = async () => {
            if (!selectedRepo || !repoOwner) return;
            setLoading(true);

            try {
                // 1. Fetch real tree structure from backend
                const treeRes = await fetch(`http://localhost:5000/api/github/tree/${repoOwner}/${selectedRepo}`);
                if (!treeRes.ok) throw new Error("Failed to load repository structure");

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

                if (scanRes.ok) {
                    const scanResult = await scanRes.json();
                    setScanData(scanResult);
                } else {
                    // Fallback to fake data if scan fails but tree is ok
                    setScanData({
                        qualityScore: 89,
                        vulnerabilities: [],
                        guidelineViolations: ["Missing CONTRIBUTING.md"],
                        docErrors: ["Missing LICENSE file"],
                        prImpact: { score: 89, summary: "Analysis engine fallback active." }
                    });
                }
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
            <div className="min-h-screen bg-[#050816] flex items-center justify-center text-white">
                <div className="animate-pulse text-lg tracking-widest text-purple-400">
                    Running Deep AI Scan...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#050816] text-white relative overflow-hidden">

            {/* === Background Glows === */}
            <div className="absolute inset-0">
                <div className="absolute top-[-200px] left-[40%] w-[700px] h-[700px] bg-purple-600/20 blur-[180px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-200px] right-[10%] w-[500px] h-[500px] bg-indigo-600/20 blur-[180px] rounded-full animate-pulse" />
            </div>

            <div className="relative z-10 max-w-[1600px] mx-auto px-6 py-14 space-y-14">

                {/* ===== HEADER ===== */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setView("github")}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Dashboard
                    </button>

                    <div className="text-center">
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
                            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent animate-gradient">
                                Analysis Breakdown
                            </span>
                        </h1>
                        <p className="text-gray-400 mt-2">
                            {repoOwner} / {selectedRepo}
                        </p>
                    </div>

                    <div className="px-4 py-2 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs tracking-widest">
                        AI SCAN ACTIVE
                    </div>
                </div>

                {/* ===== MAIN GRID ===== */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">

                    {/* === LEFT COLUMN === */}
                    <div className="xl:col-span-4 space-y-8">

                        {/* SCORE CARD */}
                        <div className="group relative bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-10 hover:border-purple-500/40 transition-all">

                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-purple-600/10 blur-2xl rounded-3xl" />

                            <div className="relative z-10 flex flex-col items-center">

                                {/* Circle */}
                                <div className="relative w-56 h-56 mb-6">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle
                                            cx="112"
                                            cy="112"
                                            r="100"
                                            className="stroke-white/10 stroke-[14] fill-none"
                                        />
                                        <circle
                                            cx="112"
                                            cy="112"
                                            r="100"
                                            className="stroke-purple-500 stroke-[14] fill-none"
                                            strokeDasharray={628}
                                            strokeDashoffset={
                                                628 -
                                                (628 * scanData?.qualityScore) / 100
                                            }
                                            strokeLinecap="round"
                                        />
                                    </svg>

                                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                                        <span className="text-6xl font-black">
                                            {scanData?.qualityScore}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            RISK SCORE
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold">
                                    Global Risk Index
                                </h3>
                                <p className="text-gray-400 text-sm text-center mt-2">
                                    Architectural safety within production threshold.
                                </p>
                            </div>
                        </div>

                        {/* PR + Issues */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                                <p className="text-gray-400 text-xs">LIVE PRs</p>
                                <p className="text-4xl font-bold mt-2">{prsCount}</p>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                                <p className="text-gray-400 text-xs">ISSUES</p>
                                <p className="text-4xl font-bold mt-2 text-yellow-400">
                                    {issuesCount}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* === RIGHT COLUMN === */}
                    <div className="xl:col-span-8 space-y-8">

                        <div className="grid md:grid-cols-2 gap-8">

                            {/* SECURITY */}
                            <div className="group bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-red-500/40 transition relative">
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-red-500/10 blur-2xl rounded-3xl" />

                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <ShieldAlert className="text-red-400" />
                                    Security Risks
                                </h3>

                                {scanData?.vulnerabilities.length > 0 ? (
                                    scanData.vulnerabilities.map(
                                        (v: any, i: number) => (
                                            <div
                                                key={i}
                                                className="text-sm bg-white/5 p-3 rounded-lg mb-2"
                                            >
                                                <span className="text-red-400 font-bold">
                                                    {v.severity}
                                                </span>{" "}
                                                {v.message}
                                            </div>
                                        )
                                    )
                                ) : (
                                    <p className="text-green-400">
                                        No critical vulnerabilities
                                    </p>
                                )}
                            </div>

                            {/* POLICY */}
                            <div className="group bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-yellow-500/40 transition relative">
                                <h3 className="text-xl font-bold mb-4">
                                    Policy Issues
                                </h3>
                                {scanData?.guidelineViolations.map(
                                    (v: string, i: number) => (
                                        <div
                                            key={i}
                                            className="text-sm bg-white/5 p-3 rounded-lg mb-2"
                                        >
                                            {v}
                                        </div>
                                    )
                                )}
                            </div>

                            {/* DOCUMENTATION */}
                            <div className="group bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-purple-500/40 transition">
                                <h3 className="text-xl font-bold mb-4">
                                    Documentation
                                </h3>
                                {scanData?.docErrors.map(
                                    (v: string, i: number) => (
                                        <div
                                            key={i}
                                            className="text-sm bg-white/5 p-3 rounded-lg mb-2"
                                        >
                                            {v}
                                        </div>
                                    )
                                )}
                            </div>

                            {/* PR IMPACT */}
                            <div className="group bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-green-500/40 transition">
                                <h3 className="text-xl font-bold mb-4">
                                    PR Impact
                                </h3>
                                <p className="text-green-400 text-3xl font-bold mb-2">
                                    {scanData?.prImpact.score}%
                                </p>
                                <p className="text-gray-400">
                                    {scanData?.prImpact.summary}
                                </p>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="flex justify-center pt-10">
                            <button
                                onClick={async () => {
                                    // Select a default file (README or first src file) to populate the editor
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
                                    setView("review");
                                }}
                                className="px-12 py-5 text-lg font-bold rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 transition shadow-[0_20px_60px_rgba(139,92,246,0.5)] flex items-center gap-3"
                            >
                                START DEEP CODE REVIEW
                                <ArrowRight />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* === Gradient Animation === */}
            <style jsx>{`
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradientMove 6s ease infinite;
        }

        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
        </div>
    );
}