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
        // Enforce 10 question limit
        if (history.length >= 10) {
            alert("Phase 1 Complete. Initializing Coding Arena Protocol...")
            router.push("/arena")
            return
        }

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
        <div className={`min-h-screen transition-all duration-1000 bg-[#050a14] relative overflow-hidden flex flex-col items-center p-4 md:p-8`}>
            {/* Cyber Background */}
            <div className="absolute inset-0 bg-cyber-grid z-0 opacity-20 pointer-events-none" />

            {/* Cinema Mode Toggle */}
            <div className="absolute top-4 right-4 z-50">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCinemaMode(!cinemaMode)}
                    className={`transition-colors text-cyan-500 hover:text-cyan-400 hover:bg-cyan-950/30`}
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
                        <Card className={`overflow-hidden border neon-border shadow-[0_0_50px_rgba(0,243,255,0.1)] transition-all duration-500 bg-[#0a0f1e]/90 backdrop-blur-xl`}>
                            <div className={`h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-[#ff0099]`} />
                            <CardHeader className="md:px-8 md:pt-8 pb-4">
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`text-xs font-bold uppercase tracking-widest text-cyan-500 font-mono`}>
                                        /// QUESTION_SEQUENCE_0{history.length + 1}
                                    </span>
                                    <div className="flex items-center gap-4">
                                        {evaluating && <span className="text-xs text-[#ffe600] animate-pulse font-mono">PROCESSING_RESPONSE...</span>}
                                        <span className={`text-xs font-bold text-slate-400 font-mono`}>SCORE: {score}</span>
                                    </div>
                                </div>
                                <h2 className={`text-2xl md:text-3xl font-bold leading-tight text-white font-orbitron tracking-wide`}>
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
                                                height: isListening ? [4, 15, 8, 30, 12, 40, 6, 20, 4] : 4,
                                                transition: {
                                                    repeat: Infinity,
                                                    duration: 0.5 + (i * 0.1), // Varied duration per bar
                                                    delay: i * 0.05
                                                }
                                            }}
                                            className={`w-1.5 rounded-none transition-colors duration-300 ${isListening ? 'bg-[#ff0099] shadow-[0_0_10px_#ff0099]' : 'bg-cyan-900/50'}`}
                                        />
                                    ))}
                                </div>

                                {feedback ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`rounded-none p-6 backdrop-blur-md border ${feedback.rating >= 7
                                            ? 'bg-green-950/30 border-green-500/50'
                                            : 'bg-red-950/30 border-red-500/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            {feedback.rating >= 7
                                                ? <CheckCircle2 className={`w-5 h-5 text-green-400`} />
                                                : <AlertTriangle className={`w-5 h-5 text-red-400`} />
                                            }
                                            <span className={`font-bold font-mono ${feedback.rating >= 7 ? 'text-green-400' : 'text-red-400'}`}>ANALYSIS_RESULT (SCORE: {feedback.rating}/10)</span>
                                        </div>
                                        <p className={`text-sm leading-relaxed text-slate-300 font-mono`}>{feedback.feedback}</p>
                                    </motion.div>
                                ) : (
                                    <div className="relative group">
                                        <textarea
                                            className={`w-full rounded-none border border-cyan-900/50 p-4 text-lg shadow-inner transition-all focus:ring-0 focus:border-cyan-500 disabled:opacity-50 bg-[#050a14] text-cyan-50 placeholder:text-cyan-900/50 font-mono`}
                                            placeholder=">> INPUT_RESPONSE..."
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
                                        className={`rounded-none h-12 w-12 border-2 transition-all ${isListening
                                            ? "bg-red-600 border-red-500 text-white animate-pulse"
                                            : "bg-slate-900 border-cyan-900 text-cyan-400 hover:border-cyan-500 hover:text-cyan-300"
                                            }`}
                                    >
                                        {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => playAudio(currentQuestion.question)}
                                        disabled={isSpeaking || evaluating}
                                        className={`rounded-none h-12 w-12 border-2 transition-all bg-slate-900 border-cyan-900 text-cyan-400 hover:border-cyan-500 hover:text-cyan-300
                                            }`}
                                    >
                                        {isSpeaking ? <Loader2 className="h-5 w-5 animate-spin" /> : <Volume2 className="h-5 w-5" />}
                                    </Button>
                                </div>
                                <div className="flex-1 flex gap-3">
                                    {feedback ? (
                                        <Button onClick={handleNext} className="w-full h-12 rounded-none text-lg bg-cyan-600 hover:bg-cyan-500 text-black font-bold uppercase tracking-wider">
                                            {history.length >= 10 ? "Finish Interview" : "Next Mission"} <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleSubmit(true)}
                                                className={`h-12 rounded-none px-6 border-cyan-900 text-cyan-500 hover:bg-cyan-950/50 hover:text-cyan-400 font-mono`}
                                            >
                                                SKIP_SEQUENCE
                                            </Button>
                                            <Button
                                                onClick={() => handleSubmit(false)}
                                                disabled={(!userAnswer && !isListening) || evaluating}
                                                className="flex-1 h-12 rounded-none text-lg bg-[#ffe600] text-black hover:bg-[#e6cf00] font-bold uppercase tracking-wider relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {evaluating ? "ANALYZING..." : "DEPLOY ANSWER"}
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
