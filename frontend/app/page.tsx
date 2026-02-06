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
      <nav className="fixed top-0 w-full z-50 glass border-b border-cyan-900/30 px-6 py-4 flex justify-between items-center bg-[#050a14]/80 backdrop-blur-md">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter group cursor-pointer">
          <div className="w-8 h-8 bg-cyan-950/50 border border-cyan-500/50 rounded-none flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all duration-300">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <span className="text-white font-orbitron tracking-widest text-lg">KAUSHAL<span className="text-cyan-400">.AI</span></span>
        </div>
        <div className="flex gap-4">
          {/* Future Nav Items */}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center pt-24 px-6 md:px-12 lg:px-24 overflow-hidden border-b border-white/10">
        {/* Cyber Grid Background */}
        <div className="absolute inset-0 bg-[#050a14] z-0" />
        <div className="absolute inset-0 bg-cyber-grid z-0 opacity-40" />

        {/* Glow Spheres */}
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-[#ff0099]/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-5xl mx-auto mb-16 relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-none border border-cyan-500/30 bg-cyan-950/20 backdrop-blur-sm mb-8">
            <span className="w-2 h-2 bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
            <span className="text-sm font-bold tracking-widest text-cyan-400 uppercase">System Online | v2.0 Arena</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] text-white uppercase relative">
            <span className="block mb-2 glitch" data-text="Enter The">Enter The</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-[#ff0099] neon-text-glow">Coding Arena</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto font-light tracking-wide">
            Upgrade your career stack. <strong className="text-cyan-400">Kaushal.ai</strong> is the ultimate battleground to prep for your next tech interview.
          </p>
        </motion.div>

        {/* Upload Interface - Cyberpunk Style */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-20 max-w-2xl mx-auto w-full"
        >
          {/* Neon Border Container */}
          <div className={`relative p-[1px] bg-gradient-to-r from-cyan-500 via-purple-500 to-[#ff0099] ${isDragging ? "animate-pulse" : ""}`}>
            <div className={`bg-[#0a0f1e] p-10 text-center relative overflow-hidden transition-all duration-300 group`}>

              {/* Scanlines Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_4px,3px_100%]" />

              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className="relative z-10 cursor-pointer"
              >
                <AnimatePresence mode="wait">
                  {file ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-4"
                    >
                      <div className="mx-auto w-20 h-20 bg-cyan-950/50 border border-cyan-500/50 flex items-center justify-center mb-6 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)] rounded-none">
                        <CheckCircle className="w-10 h-10" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1 font-mono">{file.name}</h3>
                      <p className="text-sm text-cyan-500/70 mb-8 font-mono uppercase tracking-widest">{uploadSuccess ? ">> Analysis Complete" : ">> Ready to Initialize"}</p>

                      {loading ? (
                        <div className="space-y-4 max-w-sm mx-auto">
                          <div className="h-1 w-full bg-slate-800 overflow-hidden relative">
                            <div className="h-full bg-cyan-500 absolute top-0 left-0" style={{ width: `${progress}%`, boxShadow: '0 0 10px #06b6d4' }}></div>
                          </div>
                          <div className="flex justify-between text-xs font-mono text-cyan-500">
                            <span>PROCESSING_DATA</span>
                            <span>{progress}%</span>
                          </div>
                        </div>
                      ) : uploadSuccess ? (
                        <div className="space-y-4">
                          <div className="bg-cyan-950/30 border border-cyan-500/30 p-4 mb-4">
                            <p className="text-xs text-cyan-400 uppercase font-bold tracking-widest mb-1">DETECTED_CLASS</p>
                            <p className="text-xl font-bold text-white font-mono">
                              {JSON.parse(localStorage.getItem("resumeData") || "{}").detected_role || "SOFTWARE_ENGINEER"}
                            </p>
                          </div>
                          <Button onClick={() => router.push("/interview")} size="lg" className="w-full h-14 text-lg rounded-none bg-cyan-600 hover:bg-cyan-500 text-black font-bold uppercase tracking-wider relative overflow-hidden group/btn">
                            <span className="relative z-10 flex items-center justify-center">Enter Simulation <ArrowRight className="ml-2 w-5 h-5" /></span>
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500" />
                          </Button>
                        </div>
                      ) : (
                        <Button onClick={handleUpload} size="lg" className="w-full h-14 text-lg rounded-none bg-white text-black hover:bg-cyan-400 hover:text-black font-bold uppercase tracking-wider transition-all">
                          Initialize Analysis <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-10"
                    >
                      <div className="mx-auto w-24 h-24 bg-slate-900 border border-slate-700 hover:border-cyan-500/50 flex items-center justify-center mb-6 text-slate-400 hover:text-cyan-400 shadow-xl transition-all group-hover:scale-110 duration-300 rounded-none transform rotate-45 group-hover:rotate-0">
                        <div className="transform -rotate-45 group-hover:rotate-0 transition-transform duration-300">
                          <Upload className="w-10 h-10" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">Upload Resume Profile</h3>
                      <p className="text-cyan-500/80 mb-8 font-mono text-sm max-w-xs mx-auto">Target Formats: PDF, TXT (Max 5MB)</p>
                      <Button
                        onClick={() => document.getElementById("resume-upload")?.click()}
                        variant="outline"
                        className="rounded-none px-10 py-6 border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/50 hover:text-cyan-300 hover:border-cyan-400 transition-all font-mono uppercase tracking-widest text-xs"
                      >
                        [ Select Data File ]
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
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500 -mt-px -ml-px" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#ff0099] -mt-px -mr-px" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#ff0099] -mb-px -ml-px" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500 -mb-px -mr-px" />
          </div>

          {/* Error Toast */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-red-900/20 text-red-400 text-sm py-3 px-4 rounded-none border-l-4 border-red-500 font-mono"
            >
              !! SYSTEM ERROR: {error}
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Bento Grid Features - Cyberpunk Arena */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-[#050a14] border-t border-white/5 relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white uppercase neon-text-glow">Loadout Initialization</h2>
            <p className="text-cyan-400 font-mono tracking-widest text-sm">/// SELECT_TRAINING_MODULE</p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]"
          >
            {/* Large Card - Interview */}
            <motion.div variants={item} className="md:col-span-2 group relative overflow-hidden bg-card border border-white/10 p-8 flex flex-col justify-between hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(0,243,255,0.15)] transition-all duration-500">
              <div className="absolute inset-0 bg-cyber-grid opacity-20 pointer-events-none" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-cyan-950 flex items-center justify-center mb-4 text-cyan-400 border border-cyan-500/30">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white">Adaptive Combat Simulation</h3>
                <p className="text-slate-400 max-w-md font-light">AI adversary adapts to your responses in real-time. Supports Voice and Text combat modes.</p>
              </div>
              {/* Abstract UI Mockup */}
              <div className="absolute right-[-20px] bottom-[-20px] w-2/3 h-2/3 bg-[#0a0f1e] rounded-tl-none border border-cyan-500/20 p-4 transition-transform group-hover:translate-x-[-10px] group-hover:translate-y-[-10px]">
                <div className="flex gap-2 mb-4 items-center">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                  <div className="h-1 bg-cyan-900 w-full" />
                </div>
                <div className="space-y-2 font-mono text-[10px] text-cyan-700">
                  <p>&gt; INITIATING_SEQUENCE...</p>
                  <p>&gt; ANALYZING_RESPONSE...</p>
                  <p className="text-cyan-400">&gt; TARGET_LOCKED</p>
                </div>
              </div>
            </motion.div>

            {/* Tall Card - Coding */}
            <motion.div variants={item} className="md:row-span-2 group relative overflow-hidden bg-[#0a0f1e] border border-white/10 p-8 flex flex-col hover:border-[#ffe600]/50 hover:shadow-[0_0_30px_rgba(255,230,0,0.15)] transition-all duration-500">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#ffe600] to-transparent opacity-50" />
              <div className="w-12 h-12 bg-yellow-950/30 flex items-center justify-center mb-6 text-[#ffe600] border border-[#ffe600]/30 backdrop-blur-sm">
                <Code className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">Code Arena</h3>
              <p className="text-slate-400 mb-8 font-light">Live execution environment with complexity analysis.</p>

              <div className="flex-1 bg-black/50 border border-white/10 p-4 font-mono text-xs text-green-400 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 text-[8px] text-[#ffe600] uppercase tracking-wider">Python 3.10</div>
                <p className="text-pink-500">def <span className="text-yellow-400">optimize_core</span>(data):</p>
                <p className="pl-4 text-slate-500"># Complexity: O(log n)</p>
                <p className="pl-4">if not data: return 0</p>
                <p className="pl-4">buffer = []</p>
                <p className="pl-4 text-white"><span className="animate-pulse">_</span></p>

                {/* Scanline */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/10 to-transparent h-4 w-full animate-[scan_2s_linear_infinite]" />
              </div>
            </motion.div>

            {/* Standard Card - Resume */}
            <motion.div variants={item} className="group relative overflow-hidden bg-card border border-white/10 p-8 hover:border-[#ff0099]/50 hover:shadow-[0_0_30px_rgba(255,0,153,0.15)] transition-all">
              <div className="w-12 h-12 bg-pink-950/30 flex items-center justify-center mb-4 text-[#ff0099] border border-[#ff0099]/30">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Rapid Analysis</h3>
              <p className="text-slate-400 font-light">Extracts skill vectors from your resume in &lt;50ms.</p>
            </motion.div>

            {/* Standard Card - Quiz */}
            <motion.div variants={item} className="group relative overflow-hidden bg-card border border-white/10 p-8 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all">
              <div className="w-12 h-12 bg-blue-950/30 flex items-center justify-center mb-4 text-blue-400 border border-blue-500/30">
                <Play className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">S.W.A.T. Drills</h3>
              <p className="text-slate-400 font-light">Gamified technical quizzes to test your domain reflexes.</p>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 text-center text-slate-600 text-sm bg-[#020408] border-t border-white/5 font-mono">
        <p className="opacity-50">SYSTEM_ID: KAUSHAL.AI // <span className="text-cyan-500">ONLINE</span></p>
        <p className="mt-2 text-xs">Built for the next generation of engineers.</p>
      </footer>
    </main>
  )
}
