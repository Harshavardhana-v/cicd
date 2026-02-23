"use client";

import React from 'react';
import { useUIStore } from '@/store/useStore';
import WelcomeView from '@/components/views/WelcomeView';
import SelectionView from '@/components/views/SelectionView';
import GitHubView from '@/components/views/GitHubView';
import RepositoryAnalysisView from '@/components/views/RepositoryAnalysisView';
import PRDiffView from '@/components/views/PRDiffView';
import Shell from "@/components/layout/Shell";
import FileTree from "@/components/sidebar/FileTree";
import CodeEditor from "@/components/editor/Editor";
import IntelligencePanel from "@/components/panel/IntelligencePanel";

export default function Home() {
  const view = useUIStore(state => state.view);
  const codeToReview = useUIStore(state => state.codeToReview);
  const activeFile = useUIStore(state => state.activeFile);

  if (view === 'welcome') return <WelcomeView />;
  if (view === 'selection') return <SelectionView />;
  if (view === 'github') return <GitHubView />;
  if (view === 'analysis') return <RepositoryAnalysisView />;
  if (view === 'diff') return <PRDiffView />;

  return (
    <Shell
      zoneA={<FileTree />}
      zoneB={<CodeEditor code={codeToReview || undefined} fileName={activeFile ?? undefined} />}
      zoneC={<IntelligencePanel />}
    />
  );
}
