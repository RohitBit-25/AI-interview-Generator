"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle2, XCircle, ArrowLeft } from "lucide-react"

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
    const [answers, setAnswers] = useState<{ [key: number]: string }>({})
    const [showResults, setShowResults] = useState(false)
    const [score, setScore] = useState(0)

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
                setQuestions(response.data.questions)
            } catch (error) {
                console.error("Quiz Error:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchQuiz()
    }, [router])

    const handleSelect = (qIndex: number, option: string) => {
        if (showResults) return
        setAnswers(prev => ({ ...prev, [qIndex]: option }))
    }

    const handleSubmit = () => {
        let newScore = 0
        questions.forEach((q, i) => {
            if (answers[i] === q.correct_answer) newScore++
        })
        setScore(newScore)
        setShowResults(true)
    }

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2">Generating Skill Quiz...</span>
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <Button variant="ghost" className="mb-4" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>

            <div className="mx-auto max-w-3xl space-y-6">
                <header className="text-center">
                    <h1 className="text-3xl font-bold">Skill Assessment</h1>
                    <p className="text-slate-500">Test your knowledge based on your resume skills.</p>
                </header>

                {questions.map((q, i) => (
                    <Card key={i} className="overflow-hidden">
                        <CardHeader className="bg-white pb-2">
                            <CardTitle className="text-lg">
                                <span className="mr-2 text-blue-600">Q{i + 1}.</span>
                                {q.question}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2 p-6 pt-2">
                            {q.options.map((opt) => {
                                const isSelected = answers[i] === opt
                                const isCorrect = q.correct_answer === opt
                                let cleanClass = "justify-start text-left h-auto py-3 px-4"

                                if (showResults) {
                                    if (isCorrect) cleanClass += " bg-green-100 border-green-500 text-green-700 hover:bg-green-100"
                                    else if (isSelected && !isCorrect) cleanClass += " bg-red-100 border-red-500 text-red-700 hover:bg-red-100"
                                    else cleanClass += " opacity-50"
                                } else {
                                    if (isSelected) cleanClass += " border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500"
                                }

                                return (
                                    <Button
                                        key={opt}
                                        variant="outline"
                                        className={cleanClass}
                                        onClick={() => handleSelect(i, opt)}
                                    >
                                        <div className="flex w-full items-center justify-between">
                                            <span>{opt}</span>
                                            {showResults && isCorrect && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                                            {showResults && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-red-600" />}
                                        </div>
                                    </Button>
                                )
                            })}

                            {showResults && (
                                <div className="mt-2 rounded-md bg-slate-100 p-3 text-sm text-slate-700">
                                    <strong>Explanation:</strong> {q.explanation}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}

                {!showResults ? (
                    <Button className="w-full" size="lg" onClick={handleSubmit} disabled={Object.keys(answers).length < questions.length}>
                        Submit Quiz
                    </Button>
                ) : (
                    <div className="rounded-lg bg-blue-600 p-6 text-center text-white">
                        <h2 className="text-2xl font-bold">You Scored {score} / {questions.length}</h2>
                        <Button className="mt-4 bg-white text-blue-600 hover:bg-blue-50" onClick={() => router.push("/dashboard")}>
                            Return to Dashboard
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
