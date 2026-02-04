"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Loader2, Send, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"

interface Question {
    question: string
    type: string
    topic: string
    hints: string[]
}

export default function InterviewPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [questions, setQuestions] = useState<Question[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [userAnswer, setUserAnswer] = useState("")
    const [feedback, setFeedback] = useState<any>(null)
    const [evaluating, setEvaluating] = useState(false)
    const [score, setScore] = useState(0)

    useEffect(() => {
        const startInterview = async () => {
            const resumeData = localStorage.getItem("resumeData")
            if (!resumeData) {
                router.push("/")
                return
            }

            const data = JSON.parse(resumeData)
            try {
                // Generate questions based on resume text
                const response = await axios.post("http://127.0.0.1:8000/api/generate-questions", {
                    resume_text: data.text,
                    role: "Software Engineer", // Default for now, could be dynamic
                    difficulty: "Medium",
                    count: 3
                })

                setQuestions(response.data.questions)
                setLoading(false)
            } catch (error) {
                console.error("Error generating questions:", error)
                // Fallback/Mock for demo if API fails
                setQuestions([
                    { question: "Could you tell me a little bit about yourself?", type: "Behavioral", topic: "Intro", hints: ["Elevator pitch"] }
                ])
                setLoading(false)
            }
        }

        startInterview()
    }, [router])

    const handleSubmit = async () => {
        if (!userAnswer.trim()) return

        setEvaluating(true)
        try {
            const currentQ = questions[currentIndex]
            const response = await axios.post("http://127.0.0.1:8000/api/evaluate", {
                question: currentQ.question,
                user_answer: userAnswer
            })

            setFeedback(response.data)
            if (response.data.rating >= 7) {
                setScore(prev => prev + 1)
            }
        } catch (error) {
            console.error("Evaluation error:", error)
            setFeedback({ feedback: "Could not evaluate answer at this time.", rating: 0 })
        }
        setEvaluating(false)
    }

    const handleNext = () => {
        setFeedback(null)
        setUserAnswer("")
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1)
        } else {
            // Finish
            router.push("/dashboard")
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="mt-4 text-slate-500">Preparing your interview...</p>
            </div>
        )
    }

    const currentQ = questions[currentIndex]

    return (
        <main className="flex min-h-screen flex-col items-center bg-slate-50 p-4 md:p-8">
            <div className="w-full max-w-2xl">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Mock Interview</h1>
                        <p className="text-sm text-slate-500">
                            Question {currentIndex + 1} of {questions.length}
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="text-sm font-medium text-slate-600">Score: {score}</span>
                    </div>
                </header>

                <Progress value={((currentIndex) / questions.length) * 100} className="mb-8 h-2" />

                <Card className="mb-6 shadow-md transition-all">
                    <CardHeader>
                        <div className="mb-2 flex items-center space-x-2">
                            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                {currentQ.type}
                            </span>
                            <span className="text-xs text-slate-500">• {currentQ.topic}</span>
                        </div>
                        <CardTitle className="text-xl leading-snug">{currentQ.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {feedback ? (
                            <div className={`rounded-lg p-4 ${feedback.rating >= 7 ? 'bg-green-50 border border-green-100' : 'bg-amber-50 border border-amber-100'}`}>
                                <div className="mb-2 flex items-center">
                                    {feedback.rating >= 7 ? <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" /> : <AlertTriangle className="mr-2 h-5 w-5 text-amber-600" />}
                                    <span className="font-semibold text-slate-900">Feedback (Rating: {feedback.rating}/10)</span>
                                </div>
                                <p className="text-sm text-slate-700">{feedback.feedback}</p>
                                {feedback.better_answer && (
                                    <div className="mt-3 border-t border-slate-200 pt-2">
                                        <p className="text-xs font-semibold text-slate-500 uppercase">Suggested Answer</p>
                                        <p className="text-xs text-slate-600 mt-1 italic">"{feedback.better_answer}"</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="relative">
                                <Input
                                    placeholder="Type your answer here..."
                                    className="h-32 pb-24 align-top" // Hack for textarea-like look with Input if Textarea component not ready, or just use Input if short. Shadcn Input is usually single line.
                                // Ideally we should use Textarea component. I'll use standard <textarea> styled like input for now or assume Input handles it.
                                // Actually Shadcn has a Textarea component, but I haven't added it. I'll just use a standard textarea with Tailwind classes matching Input.
                                />
                                <textarea
                                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Type your answer here... (be detailed)"
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    disabled={evaluating}
                                />
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        {feedback ? (
                            <Button onClick={handleNext} className="w-full">
                                Next Question <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit} disabled={!userAnswer || evaluating} className="w-full">
                                {evaluating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Evaluating...
                                    </>
                                ) : (
                                    <>
                                        Submit Answer <Send className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        )}
                    </CardFooter>
                </Card>

                {!feedback && (
                    <div className="mt-4 text-center">
                        <p className="text-xs text-slate-400">Hints: {currentQ.hints.join(", ")}</p>
                    </div>
                )}
            </div>
        </main>
    )
}
