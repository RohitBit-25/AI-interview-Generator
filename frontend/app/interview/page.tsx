"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Loader2, Send, CheckCircle2, AlertTriangle, ArrowRight, Mic, MicOff, Volume2, Maximize2, Monitor } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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

    // Cinema Mode State
    const [cinemaMode, setCinemaMode] = useState(false)
    const [volume, setVolume] = useState(0)

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

    // Visualizer Loop
    useEffect(() => {
        if (isListening) {
            const interval = setInterval(() => {
                setVolume(Math.random() * 100)
            }, 100)
            return () => clearInterval(interval)
        } else {
            setVolume(0)
        }
    }, [isListening])

    const handleSubmit = async (skipOrEvent: boolean | React.FormEvent = false) => {
        const skip = typeof skipOrEvent === 'boolean' ? skipOrEvent : false;
        if (!skip && !userAnswer.trim()) return

        setEvaluating(true)
        try {
            const resumeData = JSON.parse(localStorage.getItem("resumeData") || "{}")
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

            const response = await axios.post(`${apiUrl}/api/interview/next`, {
                resume_text: resumeData.text,
                history: history,
                last_answer: userAnswer,
                skipped: skip
            })

            const data = response.data

            const feedbackData = {
                ...data.evaluation,
                next_question: data.next_question
            }

            setFeedback(feedbackData)

            setHistory(prev => [...prev, {
                question: currentQuestion?.question,
                answer: userAnswer,
                feedback: data.evaluation
            }])

            if (data.evaluation && data.evaluation.rating >= 7) {
                setScore(prev => prev + 1)
            }

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
            alert("Interview Completed! Redirecting to Dashboard...")
            router.push("/dashboard")
        }
    }

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
        <div className={`min-h-screen transition-all duration-1000 ${cinemaMode ? 'bg-slate-950' : 'bg-slate-50'} flex flex-col items-center p-4 md:p-8 relative`}>

            {/* Cinema Mode Toggle */}
            <div className="absolute top-4 right-4 z-50">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCinemaMode(!cinemaMode)}
                    className={`transition-colors ${cinemaMode ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-500"}`}
                >
                    {cinemaMode ? <Maximize2 className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                </Button>
            </div>

            <div className="w-full max-w-2xl mt-12 md:mt-0 relative z-10 flex-1 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion.question}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className={`overflow-hidden border-0 shadow-2xl transition-all duration-500 ${cinemaMode ? 'bg-slate-900/50 backdrop-blur-xl text-slate-100' : 'bg-white/80 backdrop-blur-lg'}`}>
                            <div className={`h-2 ${cinemaMode ? 'bg-indigo-500/50' : 'bg-indigo-600'}`} />
                            <CardHeader className="md:px-8 md:pt-8 pb-4">
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`text-xs font-bold uppercase tracking-widest ${cinemaMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                        Question {history.length + 1}
                                    </span>
                                    <div className="flex items-center gap-4">
                                        {evaluating && <span className="text-xs text-amber-500 animate-pulse font-mono">Thinking...</span>}
                                        <span className={`text-xs font-bold ${cinemaMode ? 'text-slate-500' : 'text-slate-400'}`}>Score: {score}</span>
                                    </div>
                                </div>
                                <h2 className={`text-2xl md:text-3xl font-bold leading-tight ${cinemaMode ? 'text-slate-100' : 'text-slate-900'}`}>
                                    {currentQuestion.question}
                                </h2>
                            </CardHeader>
                            <CardContent className="md:px-8 md:pb-8 pt-0 space-y-6">

                                <div className="flex justify-center mb-6">
                                    <Avatar isSpeaking={isSpeaking} emotion={evaluating ? "thinking" : feedback ? "happy" : "neutral"} />
                                </div>

                                {/* Audio Visualizer */}
                                <div className="h-12 flex items-center justify-center gap-1.5 opacity-80">
                                    {[...Array(15)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            animate={{
                                                height: isListening ? [4, Math.random() * 40, 4] : 4,
                                                transition: {
                                                    repeat: Infinity,
                                                    duration: 0.5,
                                                    delay: i * 0.05
                                                }
                                            }}
                                            className={`w-1.5 rounded-full transition-colors duration-300 ${isListening ? 'bg-indigo-500' : (cinemaMode ? 'bg-slate-700' : 'bg-slate-200')}`}
                                        />
                                    ))}
                                </div>

                                {feedback ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`rounded-xl p-6 backdrop-blur-md border ${feedback.rating >= 7
                                            ? (cinemaMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200')
                                            : (cinemaMode ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200')
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            {feedback.rating >= 7
                                                ? <CheckCircle2 className={`w-5 h-5 ${cinemaMode ? 'text-green-400' : 'text-green-600'}`} />
                                                : <AlertTriangle className={`w-5 h-5 ${cinemaMode ? 'text-amber-400' : 'text-amber-600'}`} />
                                            }
                                            <span className={`font-bold ${cinemaMode ? 'text-slate-200' : 'text-slate-800'}`}>Analysis (Score: {feedback.rating}/10)</span>
                                        </div>
                                        <p className={`text-sm leading-relaxed ${cinemaMode ? 'text-slate-300' : 'text-slate-600'}`}>{feedback.feedback}</p>
                                    </motion.div>
                                ) : (
                                    <div className="relative group">
                                        <textarea
                                            className={`w-full rounded-xl border-0 p-4 text-lg shadow-inner ring-1 transition-all focus:ring-2 disabled:opacity-50
                                                ${cinemaMode
                                                    ? 'bg-slate-800/50 ring-slate-700 text-slate-100 placeholder:text-slate-600 focus:bg-slate-800 focus:ring-indigo-500/50'
                                                    : 'bg-slate-50 ring-slate-200 text-slate-900 focus:bg-white focus:ring-indigo-500/20'
                                                }`}
                                            placeholder="Type your answer or speak..."
                                            rows={4}
                                            value={userAnswer}
                                            onChange={(e) => setUserAnswer(e.target.value)}
                                            disabled={evaluating}
                                        />
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="md:px-8 pb-8 pt-0 flex gap-3">
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={toggleRecording}
                                        disabled={evaluating || !!feedback}
                                        className={`rounded-full h-12 w-12 border-0 shadow-lg transition-all hover:scale-105 active:scale-95 ${isListening
                                            ? "bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-red-500/30"
                                            : (cinemaMode ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-white hover:bg-slate-50")
                                            }`}
                                    >
                                        {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => playAudio(currentQuestion.question)}
                                        disabled={isSpeaking || evaluating}
                                        className={`rounded-full h-12 w-12 border-0 shadow-lg transition-all hover:scale-105 active:scale-95 ${cinemaMode ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-white hover:bg-slate-50"
                                            }`}
                                    >
                                        {isSpeaking ? <Loader2 className="h-5 w-5 animate-spin" /> : <Volume2 className="h-5 w-5" />}
                                    </Button>
                                </div>
                                <div className="flex-1 flex gap-3">
                                    {feedback ? (
                                        <Button onClick={handleNext} className="w-full h-12 rounded-full text-lg shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30">
                                            Next Question <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleSubmit(true)}
                                                className={`h-12 rounded-full px-6 ${cinemaMode ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-500"}`}
                                            >
                                                Skip
                                            </Button>
                                            <Button
                                                onClick={() => handleSubmit(false)}
                                                disabled={(!userAnswer && !isListening) || evaluating}
                                                className="flex-1 h-12 rounded-full text-lg shadow-lg hover:translate-y-[-2px] transition-all"
                                            >
                                                Submit Answer
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
