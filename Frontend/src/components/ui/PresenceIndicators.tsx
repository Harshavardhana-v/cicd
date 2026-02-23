"use client";

import React from 'react';
import { useUIStore } from '@/store/useStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function PresenceIndicators() {
    const { activeReviewers } = useUIStore();

    if (!activeReviewers || activeReviewers.length === 0) return null;

    return (
        <TooltipProvider>
            <div className="flex items-center -space-x-3 hover:space-x-1 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
                {activeReviewers.map((user, i) => (
                    <Tooltip key={user.id}>
                        <TooltipTrigger asChild>
                            <div
                                className="relative group cursor-pointer"
                                style={{ zIndex: activeReviewers.length - i }}
                            >
                                <div
                                    className="absolute -inset-1 rounded-full blur-[2px] opacity-0 group-hover:opacity-40 transition-opacity animate-pulse"
                                    style={{ backgroundColor: user.color }}
                                />
                                <div className="relative w-9 h-9 rounded-full border-2 border-[#0B1221] overflow-hidden bg-sidebar/50 backdrop-blur-md">
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                                    />
                                    {/* Active Pulse Indicator */}
                                    <div
                                        className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#0B1221]"
                                        style={{ backgroundColor: user.color }}
                                    />
                                </div>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-black/80 backdrop-blur-xl border-white/10 text-[10px] font-black uppercase tracking-widest text-white px-3 py-1.5 rounded-lg shadow-2xl">
                            {user.name} is reviewing
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>
        </TooltipProvider>
    );
}
