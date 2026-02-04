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
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <span className="ml-2">Entering Code Arena...</span>
        </div>
    )

    return (
        <div className="h-screen flex flex-col bg-slate-900 text-slate-100">
            <header className="flex items-center justify-between border-b border-slate-700 bg-slate-800 p-4">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" className="text-slate-300" onClick={() => router.push("/dashboard")}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Exit
                    </Button>
                    <h1 className="font-bold text-white flex items-center">
                        <Code2 className="mr-2 h-5 w-5 text-purple-400" />
                        Coding Arena
                    </h1>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 rounded bg-slate-700 text-xs text-slate-300">{problem?.difficulty}</span>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Problem Description Panel */}
                <div className="w-1/3 overflow-y-auto border-r border-slate-700 bg-slate-900 p-6">
                    <h2 className="mb-4 text-xl font-bold text-white">{problem?.title}</h2>
                    <div className="prose prose-invert max-w-none text-sm text-slate-300">
                        <p>{problem?.description}</p>
                    </div>

                    {review && (
                        <div className={`mt-8 rounded-lg border p-4 ${review.is_correct ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'}`}>
                            <h3 className="mb-2 font-bold">{review.is_correct ? "✅ Passed" : "❌ Needs Improvement"}</h3>
                            <p className="mb-2 text-sm"><strong>Rating:</strong> {review.rating}/10</p>
                            <p className="mb-2 text-sm"><strong>Time Complexity:</strong> {review.time_complexity}</p>
                            <p className="text-sm italic">"{review.feedback}"</p>

                            {review.optimized_code && (
                                <div className="mt-4">
                                    <p className="text-xs font-bold uppercase text-slate-500">Suggested Solution</p>
                                    <pre className="mt-1 overflow-x-auto rounded bg-black p-2 text-xs font-mono text-green-400">
                                        {review.optimized_code}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Code Editor Panel */}
                <div className="flex w-2/3 flex-col bg-black">
                    <textarea
                        className="flex-1 resize-none bg-black p-4 font-mono text-sm text-green-400 focus:outline-none"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        spellCheck={false}
                    />
                    <div className="flex justify-end bg-slate-800 p-4">
                        <Button onClick={handleSubmit} disabled={submitting} className="bg-purple-600 hover:bg-purple-700">
                            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                            Submit Code
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
