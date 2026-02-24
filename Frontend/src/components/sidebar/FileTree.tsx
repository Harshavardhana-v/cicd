"use client";

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { FileCode, Folder, ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import { useUIStore } from '@/store/useStore';
import { validatePath } from '@/lib/security';
import { FileTreeSkeleton } from '../ui/Skeletons';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface FileNode {
    name: string;
    type: 'file' | 'folder';
    path: string;
    children?: FileNode[];
    risk?: number; // 0-100
    status?: 'modified' | 'added' | 'deleted' | 'unchanged';
}

interface FileTreeNodeProps {
    node: FileNode;
    depth?: number;
    activeFile: string | null;
    handleFileClick: (path: string) => void;
}

const RiskBadge = ({ risk }: { risk: number }) => {
    if (risk < 30) return null;
    return (
        <span className={cn(
            "text-[9px] font-black px-1.5 py-0.5 rounded-md border",
            risk > 70 ? "bg-risk-critical/10 text-risk-critical border-risk-critical/20 animate-pulse" : "bg-risk-warning/10 text-risk-warning border-risk-warning/20"
        )}>
            {risk}%
        </span>
    );
};

const FileTreeNode = ({ node, depth = 0, activeFile, handleFileClick }: FileTreeNodeProps) => {
    const isFolder = node.type === 'folder';
    const isActive = activeFile === node.path;
    const [isOpen, setIsOpen] = React.useState(depth < 1);

    const risk = node.risk || 0;

    return (
        <div className="select-none py-0.5">
            <div
                onClick={() => isFolder ? setIsOpen(!isOpen) : handleFileClick(node.path)}
                className={cn(
                    "flex items-center gap-2.5 py-2 px-4 hover:bg-white/5 cursor-pointer text-sm group transition-all rounded-xl mx-2",
                    isActive ? "bg-ai-accent/10 text-ai-accent shadow-[inset_0_0_20px_rgba(139,92,246,0.05)]" : "text-foreground/50"
                )}
                style={{ paddingLeft: `${depth * 1.2 + 1}rem` }}
            >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    {isFolder ? (
                        <div className="flex items-center gap-1.5">
                            {isOpen ? <ChevronDown className="w-4 h-4 opacity-30" /> : <ChevronRight className="w-4 h-4 opacity-30" />}
                            <Folder className={cn(
                                "w-4 h-4 transition-colors",
                                isOpen ? "text-ai-accent" : risk > 70 ? "text-risk-critical" : risk > 30 ? "text-risk-warning" : "text-blue-400/60"
                            )} />
                        </div>
                    ) : (
                        <FileCode className={cn(
                            "w-4 h-4 ml-5 transition-colors",
                            isActive ? "text-ai-accent" : risk > 70 ? "text-risk-critical shadow-[0_0_8px_rgba(239,68,68,0.4)]" : risk > 30 ? "text-risk-warning" : "text-foreground/30"
                        )} />
                    )}

                    <span className={cn(
                        "truncate font-semibold tracking-tight",
                        isActive && "font-black",
                        risk > 70 && !isActive && "text-risk-critical/80"
                    )}>
                        {node.name}
                    </span>
                </div>
                <RiskBadge risk={risk} />
            </div>
            {isFolder && isOpen && node.children && (
                <div className="mt-0.5">
                    {node.children.map(child => (
                        <FileTreeNode
                            key={child.path}
                            node={child}
                            depth={depth + 1}
                            activeFile={activeFile}
                            handleFileClick={handleFileClick}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function FileTree() {
    const {
        activeFile,
        setActiveFile,
        repoFiles,
        repoOwner,
        selectedRepo,
        repoBranch,
        setFileContent,
        fileContents,
        setCodeToReview
    } = useUIStore();

    // Convert flat GitHub tree to nested structure
    const buildTree = (files: any[]) => {
        if (!files || !Array.isArray(files)) return [];
        const root: FileNode[] = [];
        const map: Record<string, FileNode> = {};

        files.forEach(file => {
            if (!file.path || !validatePath(file.path)) return;
            const parts = file.path.split('/');
            let currentPath = '';

            parts.forEach((part: string, index: number) => {
                const isLast = index === parts.length - 1;
                const parentPath = currentPath;
                currentPath = currentPath ? `${currentPath}/${part}` : part;

                if (!map[currentPath]) {
                    const node: FileNode = {
                        name: part,
                        type: isLast && file.type === 'blob' ? 'file' : 'folder',
                        path: currentPath,
                        children: []
                    };
                    map[currentPath] = node;

                    if (index === 0) {
                        root.push(node);
                    } else if (map[parentPath]) {
                        map[parentPath].children = map[parentPath].children || [];
                        map[parentPath].children!.push(node);
                    }
                }
            });
        });

        const sortTree = (nodes: FileNode[]) => {
            nodes.sort((a, b) => {
                if (a.type === b.type) return a.name.localeCompare(b.name);
                return a.type === 'folder' ? -1 : 1;
            });
            nodes.forEach(node => {
                if (node.children) sortTree(node.children);
            });
        };

        sortTree(root);
        return root;
    };

    const treeData = React.useMemo(() => buildTree(repoFiles || []), [repoFiles]);

    const flatFiles = React.useMemo(() => {
        const list: string[] = [];
        const traverse = (nodes: FileNode[]) => {
            nodes.forEach(n => {
                if (n.type === 'file') list.push(n.path);
                if (n.children) traverse(n.children);
            });
        };
        traverse(treeData);
        return list;
    }, [treeData]);

    React.useEffect(() => {
        const handleKeys = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

            const currentIndex = flatFiles.indexOf(activeFile || '');
            if (e.key === 'j') {
                const nextFile = flatFiles[currentIndex + 1];
                if (nextFile) handleFileClick(nextFile);
            } else if (e.key === 'k') {
                const prevFile = flatFiles[currentIndex - 1];
                if (prevFile) handleFileClick(prevFile);
            }
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [activeFile, flatFiles]);

    const handleFileClick = async (path: string) => {
        setActiveFile(path);
        if (fileContents[path]) {
            setCodeToReview(fileContents[path]);
            return;
        }

        try {
            const branch = repoBranch || 'main';
            const rawUrl = `https://raw.githubusercontent.com/${repoOwner}/${selectedRepo}/${branch}/${path}`;
            const response = await fetch(rawUrl);
            if (response.ok) {
                const content = await response.text();
                setFileContent(path, content);
                setCodeToReview(content);
            } else {
                setCodeToReview(`// Failed to fetch content for ${path}`);
            }
        } catch (err) {
            console.error("Failed to fetch file:", err);
            setCodeToReview(`// Network error fetching file: ${path}`);
        }
    };

    if (!repoFiles || repoFiles.length === 0) {
        return <FileTreeSkeleton />;
    }

    return (
        <div className="py-2 space-y-0.5">
            {treeData.map(node => (
                <FileTreeNode
                    key={node.path}
                    node={node}
                    activeFile={activeFile}
                    handleFileClick={handleFileClick}
                />
            ))}
        </div>
    );
}
