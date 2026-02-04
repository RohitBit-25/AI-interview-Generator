"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface AvatarProps {
    isSpeaking: boolean
    emotion?: "neutral" | "happy" | "thinking"
}

export function Avatar({ isSpeaking, emotion = "neutral" }: AvatarProps) {
    // Simple abstract avatar using Framer Motion for pulsing effect
    return (
        <div className="flex flex-col items-center justify-center p-6">
            <div className="relative flex items-center justify-center">
                {/* Pulsing ring when speaking */}
                {isSpeaking && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0.5 }}
                        animate={{ scale: 1.2, opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                        className="absolute h-32 w-32 rounded-full bg-blue-400 opacity-25"
                    />
                )}

                {/* Core Avatar Circle */}
                <div className={`relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg border-4 ${isSpeaking ? "border-blue-300" : "border-white"}`}>
                    <span className="text-4xl text-white">
                        {emotion === "thinking" ? "🤔" : emotion === "happy" ? "😊" : "🤖"}
                    </span>
                </div>
            </div>
            <p className="mt-4 text-sm font-medium text-slate-600">
                {isSpeaking ? "AI Interviewer is speaking..." : "AI Interviewer is listening..."}
            </p>
        </div>
    )
}
