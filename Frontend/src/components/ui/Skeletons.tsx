"use client";

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const Skeleton = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
    <div className={cn("animate-pulse bg-white/5 rounded-lg", className)} style={style} />
);

export const FileTreeSkeleton = () => (
    <div className="py-6 px-10 space-y-4">
        {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-4 h-4 rounded-md" />
                <Skeleton className="h-3 flex-1 rounded-sm" style={{ width: `${Math.random() * 40 + 40}%` }} />
            </div>
        ))}
    </div>
);

export const IntelligenceCardSkeleton = () => (
    <div className="p-6 rounded-[32px] border border-white/5 bg-white/[0.01] space-y-5">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-xl" />
                <Skeleton className="w-16 h-2 rounded-full" />
            </div>
            <Skeleton className="w-10 h-4 rounded-full" />
        </div>
        <div className="space-y-2">
            <Skeleton className="w-3/4 h-5 rounded-md" />
            <Skeleton className="w-full h-3 rounded-md" />
            <Skeleton className="w-1/2 h-3 rounded-md" />
        </div>
        <div className="space-y-2">
            <Skeleton className="w-full h-1.5 rounded-full" />
        </div>
    </div>
);

export const IntelligencePanelSkeleton = () => (
    <div className="p-8 space-y-6">
        <div className="flex items-center justify-between mb-8">
            <Skeleton className="w-24 h-3 rounded-full" />
            <Skeleton className="w-16 h-5 rounded-md" />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-8">
            <Skeleton className="h-20 rounded-3xl" />
            <Skeleton className="h-20 rounded-3xl" />
        </div>
        <IntelligenceCardSkeleton />
        <IntelligenceCardSkeleton />
    </div>
);
