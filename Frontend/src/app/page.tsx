"use client";

import React from 'react';
import { useUIStore } from '@/store/useStore';
import WelcomeView from '@/components/views/WelcomeView';
import SelectionView from '@/components/views/SelectionView';
import GitHubView from '@/components/views/GitHubView';
import RepositoryAnalysisView from '@/components/views/RepositoryAnalysisView';
import Shell from "@/components/layout/Shell";
import FileTree from "@/components/sidebar/FileTree";
import CodeEditor from "@/components/editor/Editor";
import IntelligencePanel from "@/components/panel/IntelligencePanel";

export default function Home() {
  const { view, codeToReview } = useUIStore();

  if (view === 'welcome') return <WelcomeView />;
  if (view === 'selection') return <SelectionView />;
  if (view === 'github') return <GitHubView />;
  if (view === 'analysis') return <RepositoryAnalysisView />;

  return (
    <Shell
      zoneA={<FileTree />}
      zoneB={<CodeEditor code={codeToReview || undefined} />}
      zoneC={<IntelligencePanel />}
    />
  );
}
