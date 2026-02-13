"use client";

import React, { useState } from 'react';
import { useUIStore } from '@/store/useStore';
import { Github, Search, Filter, ShieldCheck, Zap, AlertCircle, ChevronLeft, ArrowRight, Star, GitBranch, RefreshCw } from 'lucide-react';
import { mockRepos, Repository } from '@/services/mockData';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function GitHubView() {
    const { setView, githubProfile, setGithubProfile, repositories, setRepositories, setSelectedRepo, setCodeToReview, setRepoOwner, setPRsCount, setIssuesCount } = useUIStore();
    const [profileInput, setProfileInput] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConnect = async () => {
        setIsConnecting(true);
        setError(null);
        try {
            const username = profileInput.replace('https://github.com/', '').replace('/', '');
            const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=12`);

            if (!response.ok) throw new Error('User not found or API limit reached');

            const data = await response.json();
            const mappedRepos = data.map((repo: any) => ({
                name: repo.name,
                owner: repo.owner.login,
                qualityScore: Math.floor(Math.random() * 20) + 75,
                lastAnalysis: new Date(repo.updated_at).toLocaleDateString(),
                issues: repo.open_issues_count,
                stars: repo.stargazers_count,
                language: repo.language || 'N/A',
                description: repo.description
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
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-start relative px-10">
            <div className="w-full max-w-[1400px] space-y-12 animate-in fade-in duration-700 pt-16 pb-24">
                {/* ... existing navigation button ... */}
                <button
                    onClick={() => setView('selection')}
                    className="flex items-center gap-2 text-sm opacity-50 hover:opacity-100 transition-opacity"
                >
                    <ChevronLeft className="w-4 h-4" /> Back to selection
                </button>

                {!githubProfile ? (
                    // ... existing connect state ...
                    <div className="max-w-xl mx-auto space-y-10 text-center py-32">
                        <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mx-auto border border-white/10 shadow-2xl">
                            <Github className="w-12 h-12" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-4xl font-bold tracking-tight">Connect Your GitHub</h2>
                            <p className="text-lg text-muted-foreground">See how your real projects perform across our quality benchmarks.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Enter GitHub username..."
                                    className="flex-1 bg-sidebar border border-border rounded-2xl px-8 py-5 text-lg focus:outline-none focus:border-ai-accent transition-all shadow-inner"
                                    value={profileInput}
                                    onChange={(e) => setProfileInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                                />
                                <button
                                    disabled={!profileInput.trim() || isConnecting}
                                    onClick={handleConnect}
                                    className="px-10 bg-ai-accent hover:bg-ai-accent/90 disabled:opacity-50 text-white rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 min-w-[180px] shadow-[0_10px_30px_rgba(139,92,246,0.3)]"
                                >
                                    {isConnecting ? <RefreshCw className="w-6 h-6 animate-spin" /> : "Connect"}
                                </button>
                            </div>
                            {error && <p className="text-risk-critical text-sm font-medium animate-bounce">{error}</p>}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-12">
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10 border-b border-border/30 pb-12">
                            <div className="flex items-center gap-8">
                                <img
                                    src={`https://github.com/${githubProfile}.png`}
                                    className="w-20 h-20 rounded-[28px] border-2 border-ai-accent shadow-2xl"
                                    alt={githubProfile}
                                />
                                <div className="space-y-2">
                                    <h2 className="text-5xl font-black tracking-tight italic bg-gradient-to-r from-foreground to-foreground/40 bg-clip-text text-transparent">{githubProfile}</h2>
                                    <p className="text-lg text-muted-foreground font-medium flex items-center gap-3">
                                        <ShieldCheck className="w-5 h-5 text-ai-accent" />
                                        Verified monitoring for <span className="text-foreground">{repositories.length}</span> active repositories
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 bg-sidebar/20 p-3 rounded-[28px] border border-white/5 backdrop-blur-xl">
                                <div className="relative">
                                    <Search className="absolute left-6 top-4 w-5 h-5 opacity-30" />
                                    <input type="text" placeholder="Search repositories..." className="bg-transparent pl-14 pr-6 py-4 text-lg focus:outline-none w-[400px] placeholder:opacity-30" />
                                </div>
                                <button className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-white/5"><Filter className="w-5 h-5 opacity-40" /></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {repositories.map((repo) => (
                                <div key={repo.name} className="glass rounded-[40px] p-10 space-y-10 hover:border-ai-accent/40 transition-all group relative overflow-hidden flex flex-col justify-between shadow-2xl">
                                    <div className="space-y-8">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-3 flex-1 min-w-0">
                                                <h3 className="font-black text-3xl group-hover:text-ai-accent transition-colors truncate">{repo.name}</h3>
                                                <div className="flex items-center gap-4">
                                                    <p className="text-xs font-black uppercase tracking-widest opacity-30 flex items-center gap-2"><GitBranch className="w-4 h-4" /> main branch</p>
                                                    <div className="h-4 w-[1px] bg-white/10" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-ai-accent/10 text-ai-accent rounded-full border border-ai-accent/20">
                                                        {repo.language}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="shrink-0 flex -space-x-3">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-sidebar flex items-center justify-center text-[10px] font-bold">
                                                        <img src={`https://i.pravatar.cc/40?u=${repo.name}${i}`} className="rounded-full w-full h-full object-cover" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <p className="text-muted-foreground text-base line-clamp-2 leading-relaxed font-medium opacity-60">
                                            {repo.description || "No description provided for this repository. CodeSage is currently tracking structural changes."}
                                        </p>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">Analysis Score</span>
                                                    <div className="text-4xl font-black italic tracking-tighter">
                                                        {repo.qualityScore}<span className="text-lg opacity-30 ml-1">%</span>
                                                    </div>
                                                </div>
                                                <div className={cn(
                                                    "px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all shadow-lg",
                                                    repo.qualityScore > 85 ? "bg-risk-safe/10 text-risk-safe border-risk-safe/20" : "bg-risk-warning/10 text-risk-warning border-risk-warning/20"
                                                )}>
                                                    {repo.qualityScore > 85 ? "Stable architecture" : "Refactoring Needed"}
                                                </div>
                                            </div>
                                            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-1000 ease-out",
                                                        repo.qualityScore > 85 ? "bg-risk-safe shadow-[0_0_20px_rgba(59,130,246,0.5)]" : "bg-risk-warning shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                                                    )}
                                                    style={{ width: `${repo.qualityScore}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="bg-white/[0.02] rounded-[28px] p-6 border border-white/5 backdrop-blur-sm group-hover:bg-white/[0.04] transition-colors">
                                                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-4">
                                                    <AlertCircle className="w-4 h-4 text-risk-warning" /> Critical Issues
                                                </div>
                                                <span className="text-4xl font-black">{repo.issues}</span>
                                            </div>
                                            <div className="bg-white/[0.02] rounded-[28px] p-6 border border-white/5 backdrop-blur-sm group-hover:bg-white/[0.04] transition-colors">
                                                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-4">
                                                    <Star className="w-4 h-4 text-amber-400" /> Community
                                                </div>
                                                <span className="text-4xl font-black">{repo.stars > 1000 ? `${(repo.stars / 1000).toFixed(1)}k` : repo.stars}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-10 flex items-center justify-between border-t border-white/5 mt-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-20">Last Scanned</span>
                                            <span className="text-sm font-bold opacity-60">{repo.lastAnalysis}</span>
                                        </div>
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                setSelectedRepo(repo.name);
                                                setRepoOwner(repo.owner);
                                                setIsConnecting(true); // Re-use loading state for transition

                                                try {
                                                    // Fetch real PR count via GitHub API
                                                    const prsResponse = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.name}/pulls?state=all&per_page=1`);
                                                    const prsLinkHeader = prsResponse.headers.get('Link');
                                                    let prTotal = 0;
                                                    if (prsLinkHeader) {
                                                        const match = prsLinkHeader.match(/page=(\d+)>; rel="last"/);
                                                        prTotal = match ? parseInt(match[1]) : 0;
                                                    } else {
                                                        const prData = await prsResponse.json();
                                                        prTotal = prData.length;
                                                    }

                                                    setPRsCount(prTotal);
                                                    setIssuesCount(repo.issues);

                                                    // Transition to analysis view
                                                    setView('analysis');
                                                } catch (err) {
                                                    console.error("Failed to fetch deep metrics", err);
                                                    setView('analysis');
                                                } finally {
                                                    setIsConnecting(false);
                                                }
                                            }}
                                            className="px-8 py-4 bg-ai-accent/10 hover:bg-ai-accent text-ai-accent hover:text-white rounded-2xl font-black text-base transition-all flex items-center gap-3 border border-ai-accent/20 hover:shadow-[0_10px_30px_rgba(139,92,246,0.3)]"
                                        >
                                            Analyze Deeply <ArrowRight className="w-5 h-5 flex-shrink-0" />
                                        </button>
                                    </div>
                                    <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:opacity-10 transition-opacity">
                                        <Zap className="w-32 h-32" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
