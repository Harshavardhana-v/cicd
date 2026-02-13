import { create } from 'zustand';

interface UIState {
    view: 'welcome' | 'selection' | 'github' | 'analysis' | 'review';
    userName: string;
    githubProfile: string | null;
    repositories: any[];
    selectedRepo: string | null;
    repoOwner: string | null;
    repoBranch: string | null;
    prsCount: number;
    issuesCount: number;
    repoFiles: any[]; // Recursive tree from GitHub
    fileContents: Record<string, string>; // Path -> Content cache
    codeToReview: string;
    setView: (view: 'welcome' | 'selection' | 'github' | 'analysis' | 'review') => void;
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
    userName: 'Developer',
    githubProfile: null,
    repositories: [],
    selectedRepo: null,
    repoOwner: null,
    repoBranch: null,
    prsCount: 0,
    issuesCount: 0,
    repoFiles: [],
    fileContents: {},
    codeToReview: '',
    setView: (view) => set({ view }),
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
    activeFile: 'src/app/page.tsx',
    setActiveFile: (fileName) => set({ activeFile: fileName }),
    isZoneAExpanded: true,
    toggleZoneA: () => set((state) => ({ isZoneAExpanded: !state.isZoneAExpanded })),
    isZoneCExpanded: true,
    toggleZoneC: () => set((state) => ({ isZoneCExpanded: !state.isZoneCExpanded })),
    currentSuggestions: [],
    setSuggestions: (suggestions) => set({ currentSuggestions: suggestions }),
}));
