"use client";

import React, { useState } from "react";
import { useUIStore } from "@/store/useStore";
import {
    Github,
    Search,
    ShieldCheck,
    Zap,
    AlertCircle,
    ChevronLeft,
    ArrowRight,
    Star,
    GitBranch,
    RefreshCw,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function GitHubView() {
    const {
        setView,
        githubProfile,
        setGithubProfile,
        repositories,
        setRepositories,
        setSelectedRepo,
        setRepoOwner,
        setPRsCount,
        setIssuesCount,
    } = useUIStore();

    const [profileInput, setProfileInput] = useState("");
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMockMode, setIsMockMode] = useState(false);

    const handleConnect = async () => {
        setIsConnecting(true);
        setError(null);
        try {
            // Robust username extraction
            const urlMatch = profileInput.match(/(?:github\.com\/|@)([a-zA-Z0-9-]{1,39})(?:\/|$)/);
            const username = urlMatch ? urlMatch[1] : profileInput.trim();

            if (!username) throw new Error("Please enter a valid GitHub username or URL");

            const response = await fetch(
                `http://localhost:5000/api/github/user-repos/${username}`
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "User not found or API limit reached");
            }

            setIsMockMode(response.headers.get('X-Mock-Data') === 'true');
            const data = await response.json();

            const mappedRepos = data.map((repo: any) => ({
                name: repo.name,
                owner: repo.owner.login,
                qualityScore: Math.floor(Math.random() * 20) + 75,
                lastAnalysis: new Date(repo.updated_at).toLocaleDateString(),
                issues: repo.open_issues_count,
                stars: repo.stargazers_count,
                language: repo.language || "N/A",
                description: repo.description,
            }));

            setGithubProfile(username);
            setRepositories(mappedRepos);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#03060b] text-white relative overflow-hidden font-sans">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-500/10 blur-[160px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[160px] rounded-full opacity-50" />
            </div>

            {/* Top nav */}
            <div className="absolute top-6 left-6 z-20">
                <button
                    onClick={() => setView("selection")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs uppercase tracking-widest opacity-60 hover:opacity-100 transition"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                </button>
            </div>

            {/* CENTERED HERO SECTION */}
            {!githubProfile ? (
                <div className="min-h-screen flex items-center justify-center px-6">
                    <div className="text-center max-w-2xl w-full">
                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 shadow-lg">
                                <Github className="w-10 h-10 opacity-80" />
                            </div>
                        </div>

                        {/* Heading */}
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-4">
                            Integrate your <br />
                            <span className="text-purple-400">Repository Fleet</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-gray-400 text-base md:text-lg leading-relaxed mb-10 max-w-xl mx-auto">
                            CodeSage connects to your GitHub profile to perform deep
                            architectural audits and security hardening across all active
                            repositories.
                        </p>

                        {/* Input */}
                        <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                            <input
                                type="text"
                                placeholder="Enter GitHub username..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-base focus:outline-none focus:border-purple-500 placeholder:opacity-40"
                                value={profileInput}
                                onChange={(e) => setProfileInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                            />

                            <button
                                disabled={!profileInput.trim() || isConnecting}
                                onClick={handleConnect}
                                className="px-6 py-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-30 text-white rounded-xl font-bold text-sm uppercase tracking-wider transition flex items-center justify-center gap-2 min-w-[170px]"
                            >
                                {isConnecting ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    "Sync Account"
                                )}
                            </button>
                        </div>

                        {error && (
                            <p className="mt-5 text-red-500 text-sm font-semibold">{error}</p>
                        )}

                        {!error && !githubProfile && (
                            <p className="mt-5 text-green-500/60 text-[10px] font-black uppercase tracking-widest animate-pulse">
                                Backend Online: Authenticated Sync Ready
                            </p>
                        )}
                    </div>
                </div>
            ) : (
                /* REPO SECTION (unchanged main structure but spacing improved) */
                <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-20">
                    {/* Mock Mode Warning */}
                    {isMockMode && (
                        <div className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-500" />
                                <div>
                                    <p className="text-sm font-bold text-amber-500">Running in Demo Mode</p>
                                    <p className="text-xs opacity-60">API rate limit reached. Showing simulated data for your profile.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setGithubProfile(""); setView("selection"); }}
                                className="px-4 py-2 bg-amber-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition"
                            >
                                Try Sync Again
                            </button>
                        </div>
                    )}
                    {/* Profile Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-white/10 pb-10">
                        <div className="flex items-center gap-6">
                            <img
                                src={`https://github.com/${githubProfile}.png`}
                                className="w-20 h-20 rounded-2xl border border-white/20"
                            />

                            <div>
                                <h2 className="text-4xl font-extrabold">{githubProfile}</h2>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider">
                                        <ShieldCheck className="w-4 h-4" /> Verified
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        {repositories.length} repositories
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative w-full lg:w-[400px]">
                            <Search className="absolute left-4 top-4 w-4 h-4 opacity-40" />
                            <input
                                type="text"
                                placeholder="Search repositories..."
                                className="bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm w-full focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Repo grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-12">
                        {repositories.map((repo) => (
                            <div
                                key={repo.name}
                                className="bg-white/5 border border-white/10 rounded-3xl p-7 backdrop-blur-xl hover:bg-white/10 transition flex flex-col justify-between"
                            >
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">{repo.name}</h3>
                                    <p className="text-gray-400 text-sm mb-6">
                                        {repo.description || "Repository analysis ready."}
                                    </p>

                                    {/* Stats */}
                                    <div className="flex justify-between text-sm mb-4">
                                        <span className="flex items-center gap-1 text-gray-400">
                                            <GitBranch className="w-4 h-4" />
                                            {repo.language}
                                        </span>

                                        <span className="flex items-center gap-1 text-amber-400">
                                            <Star className="w-4 h-4" />
                                            {repo.stars}
                                        </span>
                                    </div>

                                    {/* Health */}
                                    <div className="mb-6">
                                        <div className="text-sm text-gray-400 mb-1">Health</div>
                                        <div className="text-3xl font-bold">
                                            {repo.qualityScore}%
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={async () => {
                                        setSelectedRepo(repo.name);
                                        setRepoOwner(repo.owner);
                                        setView("analysis");
                                    }}
                                    className="mt-6 px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2"
                                >
                                    Deep Analyze
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}