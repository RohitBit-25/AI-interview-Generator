"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Upload, CheckCircle, ArrowRight, Zap, Code, MessageSquare, BrainCircuit, Play } from "lucide-react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"

export default function Home() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")
  const [isDragging, setIsDragging] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError("")
    }
  }

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
      setError("")
    }
  }, [])

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    setProgress(10)
    setError("")

    const formData = new FormData()
    formData.append("file", file)

    try {
      const timer = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 90 : prev + 10))
      }, 200)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
      const response = await axios.post(`${apiUrl}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      clearInterval(timer)
      setProgress(100)
      localStorage.setItem("resumeData", JSON.stringify(response.data.data))

      // Stop loading to show the specific success UI with detected role
      setLoading(false)
      setUploadSuccess(true)

    } catch (err) {
      console.error(err)
      setError("Failed to upload resume. Please try again.")
      setLoading(false)
      setProgress(0)
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-slate-900 overflow-x-hidden selection:bg-primary/20">

      {/* Navbar Placeholder */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-orange-100/50 px-6 py-4 flex justify-between items-center bg-white/80">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <span className="text-slate-900">Kaushal<span className="text-orange-600">.ai</span></span>
        </div>
        <div className="flex gap-4">
          {/* Future Nav Items */}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 md:px-12 lg:px-24 overflow-hidden">
        {/* Background Texture & Mandala */}
        <div className="absolute inset-0 bg-texture opacity-40 z-0" />
        <div className="absolute inset-0 bg-jaali z-0" />

        {/* Rotating Mandala - Large Background Element */}
        <div className="absolute -top-[20%] -right-[15%] w-[800px] h-[800px] opacity-[0.08] animate-[spin_60s_linear_infinite] pointer-events-none z-0">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#f97316" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-4.9C93.5,9.3,82.1,23,71.2,34.8C60.3,46.6,49.9,56.5,38.1,64.4C26.3,72.3,13.1,78.2,-0.5,79.1C-14.1,80,-28.3,75.9,-40.5,68.2C-52.8,60.5,-63.1,49.2,-71.3,36.5C-79.5,23.8,-85.6,9.7,-84.9,-4.1C-84.2,-17.8,-76.7,-31.2,-66.9,-42.6C-57.2,-54,-45.2,-63.4,-32.4,-71.6C-19.6,-79.8,-6,-86.8,6.8,-98.6L44.7,-76.4Z" transform="translate(100 100)" />
          </svg>
        </div>
        <div className="absolute -bottom-[20%] -left-[15%] w-[600px] h-[600px] opacity-[0.06] animate-[spin_80s_linear_infinite_reverse] pointer-events-none z-0">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#14b8a6" d="M42.7,-72.8C54.8,-66.3,63.6,-53,70.9,-39.7C78.2,-26.4,84.1,-13.2,82.3,-1C80.5,11.2,71.1,22.4,62.1,33.3C53.1,44.2,44.5,54.8,33.9,62.1C23.3,69.4,10.7,73.4,-0.8,74.8C-12.3,76.2,-24.6,75,-36.4,68.7C-48.2,62.4,-59.5,51,-67.2,38.2C-74.9,25.4,-79.1,11.2,-75.8,-1.9C-72.5,-15,-61.8,-27,-51.7,-37.9C-41.6,-48.8,-32.2,-58.6,-21.2,-65.8C-10.2,-73,2.4,-77.6,15.7,-83.4L42.7,-72.8Z" transform="translate(100 100)" />
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto mb-16 relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-orange-200 shadow-sm mb-8 hover:shadow-md transition-shadow">
            <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="text-sm font-semibold tracking-wide text-orange-800 uppercase" style={{ fontFamily: 'var(--font-outfit)' }}>India's #1 Career Copilot</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.0] text-slate-900" style={{ fontFamily: 'var(--font-eczar)' }}>
            Design Your <span className="italic text-teal-700">Karma.</span><br />
            <span className="text-saffron-gradient">Stitch Your Future.</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            Like a tailored masterpiece, <strong className="text-orange-700 font-medium">Kaushal.ai</strong> weaves your skills into a narrative that recruiters can't ignore.
          </p>
        </motion.div>

        {/* Upload Puck - Central Interaction */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-20 max-w-xl mx-auto"
        >
          {/* Decorative Stitch Border Container */}
          <div className={`p-5 rounded-2xl bg-white/90 backdrop-blur-sm shadow-2xl transition-all duration-300 stitch-border ${isDragging ? "ring-4 ring-orange-200 scale-[1.02]" : ""}`}>
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className="bg-orange-50/30 rounded-lg border-2 border-dashed border-orange-200/50 p-10 text-center hover:bg-orange-50/60 transition-colors cursor-pointer relative overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {file ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-4"
                  >
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{file.name}</h3>
                    <p className="text-sm text-slate-500 mb-6">{uploadSuccess ? "Analysis Complete" : "Ready to analyze"}</p>

                    {loading ? (
                      <div className="space-y-3">
                        <div className="h-2 w-full bg-orange-100 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500 animate-shine w-full rounded-full origin-left" style={{ transform: `scaleX(${progress / 100})`, transition: 'transform 0.2s' }}></div>
                        </div>
                        <p className="text-xs text-orange-600 font-mono tracking-widest">WEAVING DATA...</p>
                      </div>
                    ) : uploadSuccess ? (
                      <div className="space-y-4">
                        <div className="bg-white border border-orange-200 p-4 rounded-lg shadow-sm">
                          <p className="text-xs text-orange-500 uppercase font-bold tracking-wider mb-1">Detected Role</p>
                          <p className="text-lg font-bold text-slate-900">
                            {JSON.parse(localStorage.getItem("resumeData") || "{}").detected_role || "Software Engineer"}
                          </p>
                        </div>
                        <Button onClick={() => router.push("/interview")} size="lg" className="w-full h-12 text-lg rounded-xl shadow-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white">
                          Start Interview <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={handleUpload} size="lg" className="w-full h-12 text-lg rounded-xl shadow-lg bg-slate-900 text-white hover:bg-slate-800">
                        Analyze Resume <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-8"
                  >
                    <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 text-orange-500 shadow-md group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Drop your resume here</h3>
                    <p className="text-slate-500 mb-8">PDF or TXT (Max 5MB)</p>
                    <Button
                      onClick={() => document.getElementById("resume-upload")?.click()}
                      variant="outline"
                      className="rounded-full px-8 border-orange-200 text-orange-700 hover:bg-orange-50"
                    >
                      Browse Files
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
              <input
                id="resume-upload"
                type="file"
                accept=".pdf,.txt"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
          {/* Error Toast */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -bottom-16 left-0 right-0 bg-red-50 text-red-600 text-sm py-3 px-4 rounded-lg text-center border border-red-100"
            >
              {error}
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Everything needed to ace the technical round</h2>
            <p className="text-slate-500">Comprehensive preparation tools in one platform.</p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]"
          >
            {/* Large Card - Interview */}
            <motion.div variants={item} className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-slate-50 border border-slate-100 p-8 flex flex-col justify-between hover:shadow-xl transition-all duration-500 hover:border-indigo-100/50">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 text-indigo-600">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Adaptive Interview</h3>
                <p className="text-slate-500 max-w-md">Our AI adapts to your responses, asking follow-up questions just like a real interviewer. Supports Voice and Text.</p>
              </div>
              {/* Abstract UI Mockup */}
              <div className="absolute right-[-20px] bottom-[-20px] w-2/3 h-2/3 bg-white rounded-tl-2xl shadow-2xl border border-slate-100 p-4 transition-transform group-hover:translate-x-[-10px] group-hover:translate-y-[-10px]">
                <div className="flex gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-2 bg-slate-100 rounded w-3/4" />
                    <div className="h-2 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="flex gap-2 flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-8 bg-indigo-600 rounded-lg w-full" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tall Card - Coding */}
            <motion.div variants={item} className="md:row-span-2 group relative overflow-hidden rounded-3xl bg-[#0F172A] text-white p-8 flex flex-col hover:shadow-2xl transition-all duration-500">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 text-white backdrop-blur-sm">
                <Code className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Coding Arena</h3>
              <p className="text-slate-400 mb-8">Integrated IDE with real-time complexity analysis and test execution.</p>

              <div className="flex-1 bg-black/30 rounded-xl border border-white/10 p-4 font-mono text-xs text-green-400">
                <p>def two_sum(nums, target):</p>
                <p className="pl-4">seen = {'{}'}</p>
                <p className="pl-4">for i, n in enumerate(nums):</p>
                <p className="pl-8">comp = target - n</p>
                <p className="pl-8 text-white"><span className="animate-pulse">|</span></p>
              </div>
            </motion.div>

            {/* Standard Card - Resume */}
            <motion.div variants={item} className="group relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-8 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4 text-orange-600">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Instant Analysis</h3>
              <p className="text-slate-500">Extracts skills and projects from your resume in seconds to tailor the session.</p>
            </motion.div>

            {/* Standard Card - Quiz */}
            <motion.div variants={item} className="group relative overflow-hidden rounded-3xl bg-blue-50 border border-blue-100 p-8 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center mb-4 text-blue-700">
                <Play className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Gamified Quizzes</h3>
              <p className="text-slate-600">Test your domain knowledge with quick-fire technical quizzes.</p>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 text-center text-slate-400 text-sm">
        <p>© 2024 PrepAI. Built for engineers.</p>
      </footer>
    </main>
  )
}
