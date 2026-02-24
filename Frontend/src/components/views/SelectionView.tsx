"use client";

import React, { useState } from "react";
import { useUIStore } from "@/store/useStore";
import {
    Terminal,
    ArrowRight,
    CornerDownLeft,
    Sparkles,
    Github,
} from "lucide-react";

const SAMPLE_CODE = `function calculateTotal(items){
 let total = 0;
 for(let i=0;i<items.length;i++){
   total += items[i].price;
 }
 return total;
}`;

export default function SelectionView() {
    const { setView, setCodeToReview } = useUIStore();
    const [inputCode, setInputCode] = useState("");

    const handleStartReview = (code?: string) => {
        const finalCode = code || inputCode;
        if (finalCode.trim().length > 0) {
            setCodeToReview(finalCode);
            setView("review");
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#050816] text-white flex items-center justify-center relative overflow-hidden">

            {/* ===== Animated Background Glow ===== */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-[-200px] left-[50%] -translate-x-1/2 w-[700px] h-[700px] bg-purple-600/20 blur-[180px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-200px] right-[10%] w-[500px] h-[500px] bg-indigo-600/20 blur-[160px] rounded-full animate-pulse" />
            </div>

            {/* ===== MAIN CENTER CONTAINER ===== */}
            <div className="relative z-10 w-full max-w-6xl px-6 text-center flex flex-col items-center">

                {/* ===== TITLE ===== */}
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6">
                    Choose your{" "}
                    <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent animate-gradient">
                        entry point
                    </span>
                </h1>

                <p className="text-lg text-gray-400 mb-16 max-w-2xl">
                    Kickstart your code intelligence session via direct input or GitHub sync.
                </p>

                {/* ===== CARDS GRID ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full">

                    {/* ===== CODE EDITOR CARD ===== */}
                    <div className="group relative bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 hover:border-purple-500/40 transition-all duration-500 shadow-xl">

                        {/* glow hover */}
                        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition bg-purple-600/10 blur-2xl" />

                        <div className="relative z-10 text-left">
                            <div className="flex items-center gap-2 text-purple-400 font-semibold mb-4">
                                <Terminal className="w-4 h-4" />
                                Editor Terminal
                            </div>

                            <textarea
                                placeholder="Paste source code..."
                                className="w-full h-[220px] bg-[#020617] border border-white/10 rounded-xl p-4 font-mono text-sm text-gray-200 focus:outline-none focus:border-purple-500 resize-none"
                                value={inputCode}
                                onChange={(e) => setInputCode(e.target.value)}
                            />

                            <div className="flex justify-between items-center mt-4">
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <CornerDownLeft className="w-3 h-3" />
                                    Cmd + Enter
                                </span>

                                <button
                                    disabled={!inputCode.trim()}
                                    onClick={() => handleStartReview()}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 transition rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg"
                                >
                                    Launch <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ===== RIGHT SIDE OPTIONS ===== */}
                    <div className="flex flex-col gap-8">

                        {/* Example code */}
                        <div
                            onClick={() => handleStartReview(SAMPLE_CODE)}
                            className="group relative bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 cursor-pointer hover:border-purple-500/40 transition-all duration-500 shadow-xl"
                        >
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-purple-600/10 blur-2xl rounded-3xl transition" />

                            <div className="relative z-10 text-left">
                                <div className="flex justify-between mb-4">
                                    <Sparkles className="text-purple-400" />
                                    <span className="text-xs text-purple-400 tracking-widest">
                                        QUICK START
                                    </span>
                                </div>

                                <h3 className="text-2xl font-bold mb-2">
                                    Try Example Code
                                </h3>

                                <p className="text-gray-400 mb-6">
                                    Visualize CodeSage intelligence on a real snippet.
                                </p>

                                <span className="text-purple-400 flex items-center gap-2">
                                    Execute <ArrowRight className="w-4 h-4" />
                                </span>
                            </div>
                        </div>

                        {/* GitHub */}
                        <div
                            onClick={() => setView("github")}
                            className="group relative bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 cursor-pointer hover:border-purple-500/40 transition-all duration-500 shadow-xl"
                        >
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-indigo-600/10 blur-2xl rounded-3xl transition" />

                            <div className="relative z-10 text-left">
                                <div className="flex items-center gap-3 mb-4">
                                    <Github className="text-purple-400" />
                                    <h3 className="text-2xl font-bold">GitHub Sync</h3>
                                </div>

                                <p className="text-gray-400 mb-6">
                                    Connect repositories for deep AI scans and monitoring.
                                </p>

                                <span className="text-purple-400 flex items-center gap-2">
                                    Sync Account <ArrowRight className="w-4 h-4" />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== gradient animation ===== */}
            <style jsx>{`
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradientMove 5s ease infinite;
        }

        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
        </div>
    );
}