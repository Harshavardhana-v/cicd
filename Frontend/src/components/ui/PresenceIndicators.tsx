"use client";

import React from 'react';
import { useUIStore } from '@/store/useStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

import { socketService } from '@/services/socketService';

export default function PresenceIndicators() {
    const { activeReviewers, setReviewers, selectedRepo, repoOwner } = useUIStore();

    React.useEffect(() => {
        if (!selectedRepo || !repoOwner) return;

        const repoId = `${repoOwner}/${selectedRepo}`;

        // Connect and join
        socketService.connect();

        // Use a mock user if not authenticated for now
        const mockUser = {
            id: Math.random().toString(36).substr(2, 9),
            name: 'Anonymous Reviewer',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
            color: '#8B5CF6'
        };

        socketService.joinRoom(repoId, mockUser);

        // Listen for updates
        socketService.onRoomOccupancy((users) => {
            setReviewers(users);
        });

        return () => {
            socketService.disconnect();
        };
    }, [selectedRepo, repoOwner, setReviewers]);

    if (!activeReviewers || activeReviewers.length === 0) return null;

    return (
        <TooltipProvider>
            <div className="flex items-center gap-4">
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
                                    <div className="relative w-8 h-8 rounded-full border-2 border-[#0B1221] overflow-hidden bg-sidebar/50 backdrop-blur-md">
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                                        />
                                        <div
                                            className="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-[#0B1221]"
                                            style={{ backgroundColor: user.color }}
                                        />
                                    </div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="bg-black/90 backdrop-blur-xl border-white/10 text-[9px] font-black uppercase tracking-widest text-white px-3 py-1.5 rounded-lg shadow-2xl">
                                {user.name}
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
                <div className="hidden lg:flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-ai-accent">Live Review</span>
                    <span className="text-[8px] font-bold opacity-30 uppercase tracking-widest">{activeReviewers.length} Active</span>
                </div>
            </div>
        </TooltipProvider>
    );
}
