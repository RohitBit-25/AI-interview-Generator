"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2, CheckCircle2, XCircle, ArrowLeft, Trophy, ArrowRight, RotateCcw } from "lucide-react"

interface Question {
    question: string
    options: string[]
    correct_answer: string
    explanation: string
}

export default function QuizPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [questions, setQuestions] = useState<Question[]>([])
    const [currentIdx, setCurrentIdx] = useState(0)
    const [selectedOption, setSelectedOption] = useState<string | null>(null)
    const [isAnswered, setIsAnswered] = useState(false)
    const [score, setScore] = useState(0)
    const [showResults, setShowResults] = useState(false)

    useEffect(() => {
        const fetchQuiz = async () => {
            const resumeData = localStorage.getItem("resumeData")
            if (!resumeData) {
                router.push("/")
                return
            }

            const data = JSON.parse(resumeData)
            const skills = data.skills || ["General"]

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
                const response = await axios.post(`${apiUrl}/api/quiz`, { skills })
                // Fallback mock if API returns empty or fails structure
                const questionsData = response.data.questions

                if (questionsData && questionsData.length > 0) {
                    setQuestions(questionsData)
                } else {
                    throw new Error("No questions returned")
                }
            } catch (error) {
                console.error("Quiz Error:", error)
                // Fallback on error
                setQuestions([
                    {
                        question: "Which hook is used for side effects in React?",
                        options: ["useState", "useEffect", "useMemo", "useCallback"],
                        correct_answer: "useEffect",
                        explanation: "useEffect is designed to handle side effects like data fetching, subscriptions, etc."
                    },
                    {
                        question: "What is the complexity of binary search?",
                        options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
                        correct_answer: "O(log n)",
                        explanation: "Binary search divides the search interval in half effectively reducing checks logarithmically."
                    }
                ])
            } finally {
                setLoading(false)
            }
        }
        fetchQuiz()
    }, [router])

    const handleOptionSelect = (option: string) => {
        if (isAnswered) return
        setSelectedOption(option)
    }

    const checkAnswer = () => {
        if (!selectedOption) return

        setIsAnswered(true)
        if (selectedOption === questions[currentIdx].correct_answer) {
            setScore(prev => prev + 1)
            confetti({
                particleCount: 30,
                spread: 30,
                origin: { y: 0.8 },
                colors: ['#22c55e', '#4ade80']
            })
        }
    }

    const nextQuestion = () => {
        if (currentIdx < questions.length - 1) {
            setCurrentIdx(prev => prev + 1)
            setSelectedOption(null)
            setIsAnswered(false)
        } else {
            setShowResults(true)
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            })

            // Log Result to Backend
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
                axios.post(`${apiUrl}/api/log`, {
                    role: "Candidate",
                    difficulty: "Medium",
                    question: "Quiz Session",
                    answer: `Score: ${score + (questions[currentIdx].correct_answer === selectedOption ? 1 : 0)}/${questions.length}`,
                    feedback: "Completed",
                    rating: Math.round(((score + (questions[currentIdx].correct_answer === selectedOption ? 1 : 0)) / questions.length) * 10),
                    type: "Quiz"
                })
            } catch (e) {
                console.error("Failed to log result", e)
            }
        }
    }

    if (loading) return (
        <div className="flex h-screen flex-col items-center justify-center bg-[#050a14]">
            <Loader2 className="h-10 w-10 animate-spin text-cyan-500 mb-4" />
            <span className="text-cyan-400 font-mono tracking-widest">INITIALIZING_ASSESSMENT_PROTOCOL...</span>
        </div>
    )

    if (showResults) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#050a14] p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-cyber-grid opacity-20 pointer-events-none" />
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-md text-center relative z-10"
                >
                    <div className="mb-6 flex justify-center">
                        <div className="rounded-full bg-yellow-500/10 p-6 border border-yellow-500/50 shadow-[0_0_30px_rgba(255,230,0,0.2)]">
                            <Trophy className="h-16 w-16 text-[#ffe600]" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 font-orbitron tracking-wide">MISSION COMPLETE</h1>
                    <p className="text-slate-400 mb-8 font-mono">Knowledge Verification Protocol Concluded.</p>

                    <Card className="mb-8 overflow-hidden border neon-border bg-[#0a0f1e]/80 backdrop-blur-md">
                        <CardHeader className="py-8 bg-gradient-to-b from-cyan-950/30 to-transparent">
                            <CardTitle className="text-5xl text-white font-mono tracking-tighter">{score} / {questions.length}</CardTitle>
                            <p className="text-cyan-400 font-bold uppercase tracking-widest text-xs mt-2">Final Proficiency Score</p>
                        </CardHeader>
                    </Card>

                    <div className="flex gap-4 justify-center">
                        <Button variant="outline" onClick={() => router.push("/dashboard")} className="border-cyan-900 text-cyan-400 hover:bg-cyan-950/50 rounded-none h-12">
                            <ArrowLeft className="mr-2 h-4 w-4" /> DASHBOARD
                        </Button>
                        <Button onClick={() => window.location.reload()} className="bg-[#ff0099] text-white hover:bg-[#d1007d] rounded-none h-12 font-bold tracking-wider">
                            <RotateCcw className="mr-2 h-4 w-4" /> RETRY_PROTOCOL
                        </Button>
                    </div>
                </motion.div>
            </div>
        )
    }

    const currentQ = questions[currentIdx]
    const progress = ((currentIdx) / questions.length) * 100

    return (
        <div className="min-h-screen bg-[#050a14] flex flex-col items-center p-4 md:p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-cyber-grid opacity-10 pointer-events-none" />

            <div className="w-full max-w-2xl relative z-10">
                <div className="mb-8 flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")} className="text-slate-500 hover:text-white hover:bg-white/5 font-mono">
                        <ArrowLeft className="mr-2 h-4 w-4" /> ABORT
                    </Button>
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-cyan-500 font-mono">SEQ_0{currentIdx + 1} // 0{questions.length}</span>
                    </div>
                </div>

                <div className="mb-10 relative h-2 bg-slate-900/50 w-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4] transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIdx}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="border neon-border bg-[#0a0f1e]/80 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                            <CardHeader className="pb-4 pt-6 border-b border-white/5">
                                <CardTitle className="text-xl md:text-2xl leading-snug text-white font-orbitron tracking-wide">
                                    {currentQ?.question}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 grid gap-3">
                                {currentQ?.options?.map((option, idx) => {
                                    const isSelected = selectedOption === option
                                    const isCorrect = currentQ.correct_answer === option

                                    let variantClass = "border-white/10 bg-slate-900/50 text-slate-300 hover:border-cyan-500/50 hover:bg-cyan-950/20"

                                    if (isAnswered) {
                                        if (isCorrect) variantClass = "border-green-500/50 bg-green-950/30 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                                        else if (isSelected) variantClass = "border-red-500/50 bg-red-950/30 text-red-400"
                                        else variantClass = "opacity-30 border-white/5 grayscale"
                                    } else if (isSelected) {
                                        variantClass = "border-cyan-500 bg-cyan-950/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleOptionSelect(option)}
                                            disabled={isAnswered}
                                            className={`relative flex w-full items-center rounded-none border p-5 text-left transition-all duration-200 group ${variantClass}`}
                                        >
                                            <span className={`mr-4 flex h-8 w-8 items-center justify-center border font-bold font-mono text-sm transition-all ${isAnswered && isCorrect ? "border-green-500 bg-green-500 text-black" :
                                                isSelected ? "border-cyan-400 bg-cyan-400 text-black" : "border-slate-600 text-slate-500 group-hover:border-cyan-500 group-hover:text-cyan-500"
                                                }`}>
                                                {String.fromCharCode(65 + idx)}
                                            </span>
                                            <span className="flex-1 font-medium font-mono text-sm tracking-wide">{option}</span>

                                            {isAnswered && isCorrect && <CheckCircle2 className="h-5 w-5 text-green-400 ml-2" />}
                                            {isAnswered && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-400 ml-2" />}
                                        </button>
                                    )
                                })}

                                {isAnswered && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="mt-6 rounded-none bg-cyan-950/20 border-l-2 border-cyan-500 p-4"
                                    >
                                        <p className="font-bold text-cyan-400 mb-1 text-xs uppercase tracking-widest">Analysis_Protocol:</p>
                                        <p className="text-sm text-slate-300 leading-relaxed">{currentQ.explanation}</p>
                                    </motion.div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </AnimatePresence>

                <div className="mt-8 flex justify-end">
                    {!isAnswered ? (
                        <Button
                            size="lg"
                            onClick={checkAnswer}
                            disabled={!selectedOption}
                            className="w-full md:w-auto px-10 rounded-none bg-[#ffe600] text-black hover:bg-[#d6c100] font-bold uppercase tracking-wider relative overflow-hidden h-14"
                        >
                            <span className="relative z-10">Execute Check</span>
                        </Button>
                    ) : (
                        <Button
                            size="lg"
                            onClick={nextQuestion}
                            className="w-full md:w-auto px-10 rounded-none bg-cyan-600 text-black hover:bg-cyan-500 font-bold uppercase tracking-wider h-14 shadow-[0_0_20px_rgba(8,145,178,0.4)]"
                        >
                            {currentIdx < questions.length - 1 ? "Next Sequence" : "Complete Mission"} <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
