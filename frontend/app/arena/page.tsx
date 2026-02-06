"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Play, ArrowLeft, Code2 } from "lucide-react"

export default function ArenaPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [problem, setProblem] = useState<any>(null)
    const [code, setCode] = useState("")
    const [review, setReview] = useState<any>(null)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        const fetchProblem = async () => {
            const resumeData = localStorage.getItem("resumeData")
            if (!resumeData) {
                router.push("/")
                return
            }
            const data = JSON.parse(resumeData)

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
                const response = await axios.post(`${apiUrl}/api/arena/problem`, {
                    resume_text: data.text,
                    role: "Software Engineer"
                })
                setProblem(response.data)
                setCode(response.data.starter_code || "# Write your solution here")
            } catch (error) {
                console.error("Arena Error:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchProblem()
    }, [router])

    const handleSubmit = async () => {
        setSubmitting(true)
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
            const response = await axios.post(`${apiUrl}/api/arena/submit`, {
                problem: problem.description,
                code: code
            })
            setReview(response.data)
        } catch (error) {
            console.error(error)
        }
        setSubmitting(false)
    }

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-[#050a14]">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
            <span className="ml-2 text-cyan-400 font-mono tracking-widest">CONNECTING_TO_ARENA_NET...</span>
        </div>
    )

    return (
        <div className="h-screen flex flex-col bg-[#050a14] text-slate-100 overflow-hidden font-sans">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-white/5 bg-[#0a0f1e] p-4 relative z-10">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-white/5 font-mono" onClick={() => router.push("/dashboard")}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> EXIT
                    </Button>
                    <h1 className="font-bold text-white flex items-center font-orbitron tracking-wider">
                        <Code2 className="mr-2 h-5 w-5 text-cyan-400" />
                        CODING_ARENA
                    </h1>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-none border border-cyan-500/30 bg-cyan-950/20 text-xs text-cyan-400 font-mono uppercase shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                        {problem?.difficulty || "EASY"}
                    </span>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                <div className="absolute inset-0 bg-cyber-grid opacity-10 pointer-events-none" />

                {/* Problem Description Panel */}
                <div className="w-1/3 overflow-y-auto border-r border-white/10 bg-[#0a0f1e]/80 p-6 backdrop-blur-sm relative z-10">
                    <h2 className="mb-6 text-xl font-bold text-white font-orbitron tracking-wide border-b border-white/10 pb-4">{problem?.title}</h2>
                    <div className="prose prose-invert max-w-none text-sm text-slate-300 font-mono leading-relaxed">
                        <p>{problem?.description}</p>
                    </div>

                    {review && (
                        <div className={`mt-8 rounded-none border-l-4 p-4 ${review.is_correct ? 'border-green-500 bg-green-950/20' : 'border-red-500 bg-red-950/20'}`}>
                            <h3 className={`mb-2 font-bold uppercase tracking-widest ${review.is_correct ? 'text-green-400' : 'text-red-400'}`}>
                                {review.is_correct ? ">> EXECUTION_SUCCESS" : ">> COMPILE_ERROR"}
                            </h3>
                            <p className="mb-1 text-sm font-mono text-slate-300"><strong>SCORE:</strong> {review.rating}/10</p>
                            <p className="mb-2 text-sm font-mono text-slate-300"><strong>COMPLEXITY:</strong> {review.time_complexity}</p>
                            <p className="text-sm italic text-slate-400 border-t border-white/5 pt-2 mt-2">"{review.feedback}"</p>

                            {review.optimized_code && (
                                <div className="mt-4">
                                    <p className="text-xs font-bold uppercase text-cyan-500 mb-2">OPTIMIZED_SOLUTION.py</p>
                                    <pre className="mt-1 overflow-x-auto rounded-none border border-white/10 bg-black/50 p-3 text-xs font-mono text-green-400">
                                        {review.optimized_code}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Code Editor Panel */}
                <div className="flex w-2/3 flex-col bg-[#050a14] relative z-10">
                    <div className="flex-1 relative overflow-hidden flex flex-col">
                        <div className="flex bg-[#0a0f1e] text-xs text-slate-500 px-4 py-2 border-b border-white/5 font-mono">
                            <span className="mr-4 text-cyan-600">main.py</span>
                        </div>
                        <div className="flex-1 flex overflow-hidden">
                            {/* Line Numbers */}
                            <div className="w-12 bg-[#0a0f1e]/50 border-r border-white/5 pt-4 text-right pr-3 text-slate-600 font-mono text-sm select-none">
                                {code.split('\n').map((_, i) => (
                                    <div key={i}>{i + 1}</div>
                                ))}
                            </div>
                            {/* Editor */}
                            <textarea
                                className="flex-1 resize-none bg-[#050a14] p-4 pt-4 font-mono text-sm text-cyan-50 focus:outline-none leading-relaxed selection:bg-cyan-900/50"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                spellCheck={false}
                                placeholder="# Initialize Algorithm..."
                            />
                        </div>
                    </div>

                    {/* Console / Output Area */}
                    <div className="h-56 border-t border-white/10 bg-[#0a0f1e] flex flex-col shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#050a14]">
                            <span className="text-xs font-bold text-cyan-600 uppercase tracking-widest font-mono">Terminal Output</span>
                            <div className="flex space-x-2">
                                <Button size="sm" onClick={() => setReview(null)} variant="ghost" className="h-6 text-xs text-slate-500 hover:text-white rounded-none">
                                    Clear
                                </Button>
                            </div>
                        </div>
                        <div className="flex-1 p-4 font-mono text-xs overflow-y-auto">
                            {submitting ? (
                                <div className="text-[#ffe600] animate-pulse">Running diagnostics...</div>
                            ) : review ? (
                                <div className={review.is_correct ? "text-green-400" : "text-red-400"}>
                                    {review.feedback ? `> ${review.feedback}` : "> Process terminated."}
                                    <br />
                                    {review.time_complexity && <span className="text-cyan-400">{`> Time Complexity: ${review.time_complexity}`}</span>}
                                </div>
                            ) : (
                                <span className="text-slate-600">{"> System Ready."}</span>
                            )}
                        </div>
                        <div className="p-4 border-t border-white/5 bg-[#050a14] flex justify-end">
                            <Button onClick={handleSubmit} disabled={submitting} className="bg-cyan-600 hover:bg-cyan-500 text-black px-8 rounded-none font-bold uppercase tracking-wider h-12 shadow-[0_0_15px_rgba(8,145,178,0.3)]">
                                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                                EXECUTE
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
