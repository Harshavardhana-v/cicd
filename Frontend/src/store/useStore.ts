import { create } from 'zustand';
import { GraphData } from '@/services/analysisEngine';

interface UIState {
    view: 'welcome' | 'selection' | 'github' | 'analysis' | 'review' | 'diff';
    focusMode: 'review' | 'analysis';
    selectedPR: number | null;
    graphData: GraphData;
    userName: string;
    githubProfile: string | null;
    repositories: any[];
    selectedRepo: string | null;
    repoOwner: string | null;
    repoBranch: string | null;
    prsCount: number;
    issuesCount: number;
    isPrivacyMode: boolean;
    activeReviewers: { id: string; name: string; avatar: string; color: string }[];
    prsTimeline: { id: string; event: string; timestamp: string; type: 'system' | 'ai' | 'human' }[];
    repoFiles: any[];
    fileContents: Record<string, string>;
    codeToReview: string;
    setView: (view: 'welcome' | 'selection' | 'github' | 'analysis' | 'review' | 'diff') => void;
    setFocusMode: (mode: 'review' | 'analysis') => void;
    setSelectedPR: (pr: number | null) => void;
    setGraphData: (data: GraphData) => void;
    setGithubProfile: (profile: string) => void;
    setRepositories: (repos: any[]) => void;
    setSelectedRepo: (repo: string | null) => void;
    setRepoOwner: (owner: string | null) => void;
    setRepoBranch: (branch: string | null) => void;
    setRepoFiles: (files: any[]) => void;
    setFileContent: (path: string, content: string) => void;
    setPRsCount: (count: number) => void;
    setIssuesCount: (count: number) => void;
    setCodeToReview: (code: string) => void;
    setPrivacyMode: (enabled: boolean) => void;
    setReviewers: (reviewers: any[]) => void;
    activeFile: string | null;
    setActiveFile: (fileName: string | null) => void;
    isZoneAExpanded: boolean;
    toggleZoneA: () => void;
    isZoneCExpanded: boolean;
    toggleZoneC: () => void;
    currentSuggestions: any[];
    setSuggestions: (suggestions: any[]) => void;
}

export const useUIStore = create<UIState>((set) => ({
    view: 'welcome',
    focusMode: 'review',
    graphData: { nodes: [], edges: [] },
    userName: 'Developer',
    githubProfile: null,
    repositories: [],
    selectedRepo: null,
    repoOwner: null,
    repoBranch: null,
    prsCount: 0,
    issuesCount: 0,
    selectedPR: null,
    repoFiles: [],
    fileContents: {},
    isPrivacyMode: false,
    activeReviewers: [],
    prsTimeline: [],
    codeToReview: '',
    setView: (view) => set({ view }),
    setFocusMode: (mode) => set({
        focusMode: mode,
        isZoneCExpanded: mode === 'analysis' ? true : true // Keep panel open or customize
    }),
    setSelectedPR: (pr) => set({ selectedPR: pr }),
    setGraphData: (graphData) => set({ graphData }),
    setGithubProfile: (profile) => set({ githubProfile: profile }),
    setRepositories: (repos) => set({ repositories: repos }),
    setSelectedRepo: (repo) => set({ selectedRepo: repo }),
    setRepoOwner: (owner) => set({ repoOwner: owner }),
    setRepoBranch: (branch) => set({ repoBranch: branch }),
    setRepoFiles: (files) => set({ repoFiles: files }),
    setFileContent: (path, content) => set((state) => ({
        fileContents: { ...state.fileContents, [path]: content }
    })),
    setPRsCount: (count) => set({ prsCount: count }),
    setIssuesCount: (count) => set({ issuesCount: count }),
    setCodeToReview: (code) => set({ codeToReview: code }),
    setPrivacyMode: (enabled) => set({ isPrivacyMode: enabled }),
    setReviewers: (reviewers) => set({ activeReviewers: reviewers }),
    activeFile: 'src/app/page.tsx',
    setActiveFile: (fileName) => set({ activeFile: fileName }),
    isZoneAExpanded: true,
    toggleZoneA: () => set((state) => ({ isZoneAExpanded: !state.isZoneAExpanded })),
    isZoneCExpanded: true,
    toggleZoneC: () => set((state) => ({ isZoneCExpanded: !state.isZoneCExpanded })),
    currentSuggestions: [],
    setSuggestions: (suggestions) => set({ currentSuggestions: suggestions }),
}));
