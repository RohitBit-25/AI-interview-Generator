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
        <div className="flex h-screen flex-col items-center justify-center bg-slate-50">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <span className="text-slate-600 font-medium">Crafting your custom quiz...</span>
        </div>
    )

    if (showResults) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-md text-center"
                >
                    <div className="mb-6 flex justify-center">
                        <div className="rounded-full bg-yellow-100 p-6 ring-8 ring-yellow-50">
                            <Trophy className="h-16 w-16 text-yellow-600" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Quiz Completed!</h1>
                    <p className="text-slate-600 mb-8">You demonstrated strong knowledge in your domain.</p>

                    <Card className="mb-8 overflow-hidden border-none shadow-xl">
                        <CardHeader className="bg-primary py-8">
                            <CardTitle className="text-4xl text-white">{score} / {questions.length}</CardTitle>
                            <p className="text-primary-foreground/80 font-medium">Final Score</p>
                        </CardHeader>
                    </Card>

                    <div className="flex gap-4 justify-center">
                        <Button variant="outline" onClick={() => router.push("/dashboard")}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Dashboard
                        </Button>
                        <Button onClick={() => window.location.reload()}>
                            <RotateCcw className="mr-2 h-4 w-4" /> Try Again
                        </Button>
                    </div>
                </motion.div>
            </div>
        )
    }

    const currentQ = questions[currentIdx]
    const progress = ((currentIdx) / questions.length) * 100

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 md:p-8">
            <div className="w-full max-w-2xl">
                <div className="mb-8 flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")} className="text-slate-500 hover:text-slate-900">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Exit
                    </Button>
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-slate-900">Question {currentIdx + 1}/{questions.length}</span>
                    </div>
                </div>

                <Progress value={progress} className="h-2 mb-8 bg-slate-200" />

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIdx}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="border-none shadow-lg">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xl md:text-2xl leading-snug text-slate-900">
                                    {currentQ?.question}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 grid gap-3">
                                {currentQ?.options?.map((option, idx) => {
                                    const isSelected = selectedOption === option
                                    const isCorrect = currentQ.correct_answer === option

                                    let variantClass = "border-slate-200 bg-white hover:bg-slate-50 hover:border-primary/50"

                                    if (isAnswered) {
                                        if (isCorrect) variantClass = "border-green-500 bg-green-50 ring-1 ring-green-500 text-green-900"
                                        else if (isSelected) variantClass = "border-red-500 bg-red-50 ring-1 ring-red-500 text-red-900"
                                        else variantClass = "opacity-50 border-slate-200 grayscale"
                                    } else if (isSelected) {
                                        variantClass = "border-primary bg-primary/5 ring-1 ring-primary text-primary"
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleOptionSelect(option)}
                                            disabled={isAnswered}
                                            className={`relative flex w-full items-center rounded-xl border-2 p-4 text-left transition-all duration-200 ${variantClass}`}
                                        >
                                            <span className={`mr-4 flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold ${isAnswered && isCorrect ? "border-green-600 bg-green-200 text-green-800" :
                                                isSelected ? "border-primary bg-primary text-white" : "border-slate-300 text-slate-500"
                                                }`}>
                                                {String.fromCharCode(65 + idx)}
                                            </span>
                                            <span className="flex-1 font-medium">{option}</span>

                                            {isAnswered && isCorrect && <CheckCircle2 className="h-5 w-5 text-green-600 ml-2" />}
                                            {isAnswered && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-600 ml-2" />}
                                        </button>
                                    )
                                })}

                                {isAnswered && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="mt-4 rounded-lg bg-slate-100 p-4"
                                    >
                                        <p className="font-semibold text-slate-800 mb-1">Explanation:</p>
                                        <p className="text-sm text-slate-600">{currentQ.explanation}</p>
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
                            className="w-full md:w-auto px-8 rounded-xl shadow-lg transition-transform active:scale-95"
                        >
                            Check Answer
                        </Button>
                    ) : (
                        <Button
                            size="lg"
                            onClick={nextQuestion}
                            className="w-full md:w-auto px-8 rounded-xl shadow-lg shadow-primary/25 transition-transform hover:-translate-y-1"
                        >
                            {currentIdx < questions.length - 1 ? "Next Question" : "Finish Quiz"} <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
