"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface AvatarProps {
    isSpeaking: boolean
    emotion?: "neutral" | "happy" | "thinking"
}

export function Avatar({ isSpeaking, emotion = "neutral" }: AvatarProps) {
    // Cyberpunk Avatar Integration
    return (
        <div className="flex flex-col items-center justify-center p-6 bg-black/40 rounded-full border border-cyan-500/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="relative flex items-center justify-center">
                {/* Holographic Pulse Ring */}
                {isSpeaking && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0.8 }}
                        animate={{ scale: 1.3, opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                        className="absolute h-40 w-40 rounded-full border-2 border-cyan-500/50 opacity-25 shadow-[0_0_20px_#06b6d4]"
                    />
                )}

                {/* Core Avatar Image Container */}
                <div className={`relative flex h-32 w-32 items-center justify-center rounded-full overflow-hidden border-4 transition-all duration-300 ${isSpeaking ? "border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.6)]" : "border-slate-700 shadow-[0_0_10px_rgba(0,0,0,0.8)]"}`}>
                    <img
                        src="/assets/cyber_avatar.jpg"
                        alt="Cyberpunk Interviewer"
                        className={`w-full h-full object-cover transition-transform duration-700 ${isSpeaking ? 'scale-110' : 'scale-100'}`}
                    />

                    {/* Digital Glitch Overlay when speaking */}
                    {isSpeaking && (
                        <div className="absolute inset-0 bg-cyan-500/10 animate-pulse mix-blend-overlay" />
                    )}
                </div>

                {/* Status Indicator Dot */}
                <div className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-black ${isSpeaking ? "bg-green-500 animate-ping" : "bg-red-500"}`} />
            </div>

            <div className="mt-6 flex flex-col items-center gap-1">
                <p className={`text-sm font-bold font-mono tracking-widest ${isSpeaking ? "text-cyan-400 animate-pulse" : "text-slate-500"}`}>
                    {isSpeaking ? ">> VOICE_OUTPUT_ACTIVE" : "// LISTENING_MODE"}
                </p>
                {emotion === 'thinking' && <span className="text-xs text-[#ffe600] font-mono animate-bounce">PROCESSING_DATA...</span>}
            </div>
        </div>
    )
}
