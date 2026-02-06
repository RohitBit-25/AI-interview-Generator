"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Upload, CheckCircle, AlertCircle, Sparkles, ArrowRight } from "lucide-react"
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

      setTimeout(() => {
        router.push("/interview")
      }, 500)

    } catch (err) {
      console.error(err)
      setError("Failed to upload resume. Please try again.")
      setLoading(false)
      setProgress(0)
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-6 md:p-24 selection:bg-primary selection:text-white">

      {/* Background Decor */}
      <div className="absolute inset-0 z-0 bg-dot-pattern opacity-40 pointer-events-none" />
      <div className="absolute top-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-5%] h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="z-10 w-full max-w-3xl text-center"
      >
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-6 shadow-sm">
          <Sparkles className="mr-2 h-3.5 w-3.5" />
          <span>AI-Powered Interview Coach</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-6xl lg:leading-tight">
          Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-500">Interview</span>
        </h1>

        <p className="mt-6 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto leading-relaxed">
          Unlock your potential with personalized, AI-generated questions tailored specifically to your resume.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="z-10 mt-12 w-full max-w-xl"
      >
        <Card className="overflow-hidden border-border/60 bg-white/80 backdrop-blur-xl shadow-2xl">
          <CardContent className="p-8">
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-300 ${isDragging
                ? "border-primary bg-primary/5 scale-[1.01]"
                : file
                  ? "border-green-500/50 bg-green-50/50"
                  : "border-slate-200 hover:border-primary/50 hover:bg-slate-50"
                } px-6 py-12 text-center`}
            >
              <AnimatePresence mode="wait">
                {file ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-col items-center"
                  >
                    <div className="mb-4 rounded-full bg-green-100 p-3 ring-4 ring-green-50">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-lg font-semibold text-slate-900">{file.name}</p>
                    <p className="text-sm text-slate-500 mb-4">{(file.size / 1024).toFixed(2)} KB</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={loading}
                    >
                      Remove File
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    <div className="mb-4 rounded-full bg-slate-100 p-4 transition-transform group-hover:scale-110">
                      <Upload className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-lg font-medium text-slate-900">
                      Drag & drop your resume
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Supports PDF or TXT up to 5MB
                    </p>
                    <div className="mt-6">
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById("resume")?.click()}
                        className="rounded-full px-8"
                      >
                        Browse Files
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Input
                id="resume"
                type="file"
                accept=".pdf,.txt"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {loading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-6 space-y-2"
              >
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span>Analyzing content...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 rounded-full bg-slate-100" />
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex items-center space-x-2 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100"
              >
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}

            <div className="mt-8">
              <Button
                className="w-full text-lg h-14 rounded-xl shadow-lg shadow-primary/20"
                onClick={handleUpload}
                disabled={!file || loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">Generating Questions...</span>
                ) : (
                  <span className="flex items-center gap-2">Start Interview <ArrowRight className="h-5 w-5" /></span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  )
}
