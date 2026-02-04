"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Loader2, Send, CheckCircle2, AlertTriangle, ArrowRight, Mic, MicOff, Volume2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/Avatar"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface Question {
    question: string
    type: string
    topic: string
    hints: string[]
}

export default function InterviewPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
    const [history, setHistory] = useState<any[]>([])
    const [userAnswer, setUserAnswer] = useState("")
    const [feedback, setFeedback] = useState<any>(null)
    const [evaluating, setEvaluating] = useState(false)
    const [score, setScore] = useState(0)

    // Voice State
    const [isListening, setIsListening] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)

    useEffect(() => {
        const startInterview = async () => {
            const resumeData = localStorage.getItem("resumeData")
            if (!resumeData) {
                router.push("/")
                return
            }

            const data = JSON.parse(resumeData)
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
                const response = await axios.post(`${apiUrl}/api/interview/start`, {
                    resume_text: data.text,
                    role: "Software Engineer"
                })

                setCurrentQuestion(response.data.question ? response.data : {
                    question: response.data.question,
                    type: response.data.type,
                    topic: response.data.topic,
                    hints: response.data.hints
                })
                setLoading(false)
            } catch (error) {
                console.error("Error starting interview:", error)
                setCurrentQuestion({
                    question: "Tell me about yourself.",
                    type: "Intro",
                    topic: "Behavioral",
                    hints: ["Be concise"]
                })
                setLoading(false)
            }
        }

        startInterview()
    }, [router])

    const handleSubmit = async () => {
        if (!userAnswer.trim()) return

        setEvaluating(true)
        try {
            const resumeData = JSON.parse(localStorage.getItem("resumeData") || "{}")
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

            // For dynamic interview, we send the answer to get the NEXT question
            // But first we want to show feedback for THIS answer.
            // So we might need to split this or trust the backend to do both.
            // The backend /next endpoint returns evaluation AND next_question.

            const response = await axios.post(`${apiUrl}/api/interview/next`, {
                resume_text: resumeData.text,
                history: history,
                last_answer: userAnswer
            })

            const data = response.data

            // Construct the complete feedback object including the next question pointer
            // This ensures state update is atomic and complete
            const feedbackData = {
                ...data.evaluation,
                next_question: data.next_question
            }

            setFeedback(feedbackData)

            // Update history with the current Q&A pair
            setHistory(prev => [...prev, {
                question: currentQuestion?.question,
                answer: userAnswer,
                feedback: data.evaluation
            }])

            if (data.evaluation && data.evaluation.rating >= 7) {
                setScore(prev => prev + 1)
            }

            // We NO LONGER need a second setFeedback call because we did it above.
            // This prevents the race condition.

        } catch (error) {
            console.error("Evaluation error:", error)
            setFeedback({
                feedback: "Error connecting to AI. Please try again.",
                rating: 0,
                next_question: null
            })
        }
        setEvaluating(false)
    }

    const handleNext = () => {
        if (feedback?.next_question) {
            setCurrentQuestion(feedback.next_question)
            setUserAnswer("")
            setFeedback(null)
        } else {
            // Either finished or error state, go to dashboard
            router.push("/dashboard")
        }
    }

    // Voice Functions
    const playAudio = async (text: string) => {
        try {
            setIsSpeaking(true)
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
            const response = await axios.post(`${apiUrl}/api/speak`, { text }, {
                responseType: 'blob'
            })
            const audioUrl = URL.createObjectURL(response.data)
            const audio = new Audio(audioUrl)
            audio.onended = () => setIsSpeaking(false)
            audio.play()
        } catch (error) {
            console.error("TTS Error:", error)
            setIsSpeaking(false)
        }
    }

    const toggleRecording = async () => {
        if (isListening) {
            mediaRecorder?.stop()
            setIsListening(false)
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                const recorder = new MediaRecorder(stream)
                const chunks: BlobPart[] = []

                recorder.ondataavailable = (e) => chunks.push(e.data)
                recorder.onstop = async () => {
                    const blob = new Blob(chunks, { type: 'audio/webm' })
                    const formData = new FormData()
                    formData.append('file', blob, 'recording.webm')

                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
                    try {
                        const response = await axios.post(`${apiUrl}/api/listen`, formData)
                        setUserAnswer(prev => prev + " " + response.data.text)
                    } catch (e) {
                        console.error("STT Error", e)
                    }
                }

                recorder.start()
                setMediaRecorder(recorder)
                setIsListening(true)
            } catch (err) {
                console.error("Mic Error:", err)
            }
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="mt-4 text-slate-500">Starting your AI interview...</p>
            </div>
        )
    }

    if (!currentQuestion) return null

    return (
        <main className="flex min-h-screen flex-col items-center bg-slate-50 p-4 md:p-8">
            <div className="w-full max-w-2xl">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">AI Interview Session</h1>
                        <p className="text-sm text-slate-500">
                            Dynamic Conversation • {history.length + 1} Qs
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="text-sm font-medium text-slate-600">Score: {score}</span>
                    </div>
                </header>

                <div className="mb-6 flex justify-center">
                    <Avatar isSpeaking={isSpeaking} emotion={evaluating ? "thinking" : feedback ? "happy" : "neutral"} />
                </div>

                <Card className="mb-6 shadow-md transition-all">
                    <CardHeader>
                        <div className="mb-2 flex items-center space-x-2">
                            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                {currentQuestion.type}
                            </span>
                            <span className="text-xs text-slate-500">• {currentQuestion.topic}</span>
                        </div>
                        <CardTitle className="text-xl leading-snug">{currentQuestion.question}</CardTitle>
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
                                        <p className="text-xs text-slate-600 mt-1 italic">&quot;{feedback.better_answer}&quot;</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="relative">
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
                    <CardFooter className="flex justify-between items-center space-x-2">
                        {/* Voice Controls */}
                        {!feedback && (
                            <Button
                                variant={isListening ? "destructive" : "secondary"}
                                onClick={toggleRecording}
                                disabled={evaluating}
                                className="w-12 h-10 px-0"
                                title="Toggle Microphone"
                            >
                                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                            </Button>
                        )}
                        {!feedback && (
                            <Button
                                variant="outline"
                                onClick={() => playAudio(currentQuestion.question)}
                                disabled={isSpeaking || evaluating}
                                className="w-12 h-10 px-0"
                                title="Read Question"
                            >
                                <Volume2 className="h-4 w-4" />
                            </Button>
                        )}

                        {feedback ? (
                            <Button onClick={handleNext} className="flex-1">
                                Next Question <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit} disabled={!userAnswer || evaluating} className="flex-1">
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

                {!feedback && currentQuestion.hints && (
                    <div className="mt-4 text-center">
                        <p className="text-xs text-slate-400">Hints: {currentQuestion.hints.join(", ")}</p>
                    </div>
                )}
            </div>
        </main>
    )
}
