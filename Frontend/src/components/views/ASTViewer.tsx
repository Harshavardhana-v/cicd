"use client";

import React, { useMemo } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Handle,
    Position,
    NodeProps,
    Edge,
    Node,
    ConnectionLineType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useUIStore } from '@/store/useStore';
import { FileCode, Zap, ShieldAlert, Cpu, Box } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// ── Custom Node Components ─────────────────────────────────────

const CodeNode = ({ data, selected }: NodeProps) => {
    const Icon = data.type === 'file' ? FileCode
        : data.type === 'function' ? Zap
            : data.type === 'class' ? Cpu
                : Box;

    return (
        <div className={cn(
            "px-4 py-3 rounded-2xl bg-[#0a0f1d] border-2 transition-all duration-300 min-w-[140px] shadow-2xl overflow-hidden group",
            selected ? "border-ai-accent shadow-[0_0_20px_rgba(139,92,246,0.3)]" : "border-white/5 hover:border-white/20"
        )}>
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />

            <div className="flex items-center gap-3 relative z-10">
                <div className={cn(
                    "p-2 rounded-xl group-hover:scale-110 transition-transform",
                    data.type === 'file' ? "bg-ai-accent/20 text-ai-accent"
                        : data.type === 'function' ? "bg-emerald-500/20 text-emerald-400"
                            : data.type === 'class' ? "bg-amber-500/20 text-amber-400"
                                : "bg-blue-500/20 text-blue-400"
                )}>
                    <Icon className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-30 leading-none mb-1">{data.type}</span>
                    <span className="text-[11px] font-bold text-foreground truncate max-w-[100px]">{data.label}</span>
                </div>
            </div>

            <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-ai-accent border-none" />
            <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-ai-accent border-none" />
        </div>
    );
};

const nodeTypes = {
    codeElement: CodeNode,
};

// ──────────────────────────────────────────────────────────────

export default function ASTViewer() {
    const { graphData, activeFile } = useUIStore();

    // Transform GraphData to ReactFlow Nodes and Edges
    const { nodes, edges } = useMemo(() => {
        if (!graphData.nodes || graphData.nodes.length === 0) {
            return { nodes: [], edges: [] };
        }

        const rfNodes: Node[] = graphData.nodes.map((n, i) => {
            // Simple grid layout logic
            const columnCount = 3;
            const x = (i % columnCount) * 220;
            const y = Math.floor(i / columnCount) * 120;

            return {
                id: n.id,
                type: 'codeElement',
                position: { x, y },
                data: { label: n.label, type: n.type },
                draggable: true,
            };
        });

        const rfEdges: Edge[] = graphData.edges.map(e => ({
            id: e.id,
            source: e.source,
            target: e.target,
            animated: true,
            style: { stroke: 'rgba(139, 92, 246, 0.4)', strokeWidth: 2 },
            type: ConnectionLineType.SmoothStep,
        }));

        return { nodes: rfNodes, edges: rfEdges };
    }, [graphData]);

    if (!activeFile) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-[#050a14]">
                <div className="w-20 h-20 rounded-full bg-ai-accent/5 border border-ai-accent/10 flex items-center justify-center mb-6">
                    <ShieldAlert className="w-8 h-8 text-ai-accent opacity-40" />
                </div>
                <h3 className="text-xl font-black italic tracking-tighter mb-2">No Module Selected</h3>
                <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                    Select a component or file from the navigator to visualize its structural intelligence.
                </p>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-[#050a14] relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                className="bg-dot-pattern"
            >
                <Background color="rgba(255,255,255,0.03)" gap={20} size={1} />
                <Controls className="bg-black/50 border-white/5 rounded-xl overflow-hidden scale-75 origin-bottom-left" />
            </ReactFlow>

            {/* Overlay Info */}
            <div className="absolute top-8 left-8 pointer-events-none z-20">
                <div className="bg-black/40 backdrop-blur-xl border border-white/5 p-5 rounded-[32px] space-y-1 shadow-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-ai-accent animate-pulse" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Intelligence Graph</h4>
                    </div>
                    <p className="text-lg font-black italic tracking-tight">{activeFile.split('/').pop()}</p>
                    <div className="flex gap-4 pt-2">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black opacity-20 uppercase">Nodes</span>
                            <span className="text-xs font-bold text-ai-accent">{nodes.length}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black opacity-20 uppercase">Dependencies</span>
                            <span className="text-xs font-bold text-emerald-400">{edges.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .bg-dot-pattern {
                    background-image: radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px);
                    background-size: 20px 20px;
                }
                .react-flow__edge-path {
                    stroke-dasharray: 4;
                    animation: dash 10s linear infinite;
                }
                @keyframes dash {
                    from { stroke-dashoffset: 100; }
                    to { stroke-dashoffset: 0; }
                }
            `}</style>
        </div>
    );
}
