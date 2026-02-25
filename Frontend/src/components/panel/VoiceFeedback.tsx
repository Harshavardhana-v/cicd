"use client";

import React, { useState, useRef } from 'react';
import { Mic, Square, Play, Pause, Trash2, Volume2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function VoiceFeedback() {
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasRecording, setHasRecording] = useState(false);
    const [timer, setTimer] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startRecording = () => {
        setIsRecording(true);
        setHasRecording(false);
        setTimer(0);
        intervalRef.current = setInterval(() => {
            setTimer(prev => prev + 1);
        }, 1000);
    };

    const stopRecording = () => {
        setIsRecording(false);
        setHasRecording(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 space-y-6 hover:border-ai-accent/20 transition-all group/voice">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-ai-accent/10 flex items-center justify-center group-hover/voice:scale-110 transition-transform">
                        <Volume2 className="w-5 h-5 text-ai-accent" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black tracking-tight">Voice Feedback</h4>
                        <p className="text-[9px] opacity-30 font-black uppercase tracking-widest">Async Collaborative Note</p>
                    </div>
                </div>
                {isRecording && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-risk-critical/10 rounded-full border border-risk-critical/20 animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-risk-critical" />
                        <span className="text-[10px] font-black text-risk-critical uppercase">{formatTime(timer)}</span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                {!hasRecording && !isRecording && (
                    <button
                        onClick={startRecording}
                        className="flex-1 h-14 rounded-[24px] bg-ai-accent text-white flex items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] active:scale-95 transition-all shadow-lg"
                    >
                        <Mic className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">Start Recording</span>
                    </button>
                )}

                {isRecording && (
                    <button
                        onClick={stopRecording}
                        className="flex-1 h-14 rounded-[24px] bg-risk-critical text-white flex items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] active:scale-95 transition-all shadow-lg"
                    >
                        <Square className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">Stop & Save</span>
                    </button>
                )}

                {hasRecording && (
                    <>
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="flex-1 h-14 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center gap-4 hover:bg-white/10 transition-all group/play"
                        >
                            <div className="w-10 h-10 rounded-xl bg-ai-accent/10 flex items-center justify-center text-ai-accent">
                                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                            </div>
                            <div className="flex flex-col items-start pr-4">
                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Review Note</span>
                                <span className="text-[9px] opacity-30 font-mono mt-1">0:12 / 0:12</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setHasRecording(false)}
                            className="w-14 h-14 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center hover:bg-risk-critical/10 hover:text-risk-critical hover:border-risk-critical/20 transition-all"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </>
                )}
            </div>

            <p className="text-[9px] text-center opacity-20 font-medium tracking-wide">
                All voice notes are encrypted E2E and transcribed automatically.
            </p>
        </div>
    );
}
