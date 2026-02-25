"use client";

import React from 'react';
import { useUIStore } from '@/store/useStore';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
    Clock,
    ShieldAlert,
    Cpu,
    User,
    CheckCircle2,
    History
} from 'lucide-react';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function ReviewTimeline() {
    const { prsTimeline } = useUIStore();

    if (!prsTimeline || prsTimeline.length === 0) return null;

    return (
        <div className="space-y-8 pt-10 border-t border-white/5">
            <div className="flex items-center justify-between px-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 flex items-center gap-4">
                    <History className="w-4 h-4" /> Review Timeline
                </h3>
            </div>

            <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/5">
                {prsTimeline.map((item, i) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className="relative group"
                    >
                        {/* Timeline Connector Dot */}
                        <div className={cn(
                            "absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-background z-10 transition-all group-hover:scale-125",
                            item.type === 'ai' ? "bg-ai-accent shadow-[0_0_10px_rgba(139,92,246,0.5)]" :
                                item.type === 'human' ? "bg-emerald-500" : "bg-white/20"
                        )} />

                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <span className={cn(
                                    "text-[11px] font-black uppercase tracking-wider",
                                    item.type === 'ai' ? "text-ai-accent" :
                                        item.type === 'human' ? "text-emerald-500" : "text-foreground/60"
                                )}>
                                    {item.event}
                                </span>
                                <span className="text-[9px] font-medium opacity-20 flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5" /> {item.timestamp}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                {item.type === 'ai' && <Cpu className="w-3 h-3 text-ai-accent opacity-40" />}
                                {item.type === 'human' && <User className="w-3 h-3 text-emerald-500 opacity-40" />}
                                <div className="h-[1px] flex-1 bg-white/[0.02] pr-4" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Final Status */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mx-2 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">Current Status: Stable</span>
                </div>
                <div className="text-[9px] font-bold opacity-30 italic">Ready for Final Review</div>
            </motion.div>
        </div>
    );
}
