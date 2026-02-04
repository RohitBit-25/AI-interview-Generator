"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"
import axios from "axios"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"

export default function Home() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError("")
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    setProgress(10)
    setError("")

    const formData = new FormData()
    formData.append("file", file)

    try {
      // Simulate progress
      const timer = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 90 : prev + 10))
      }, 200)

      const response = await axios.post("http://127.0.0.1:8000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      clearInterval(timer)
      setProgress(100)

      // Store resume data in localStorage for simplicity in this demo
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 md:p-24">
      <div className="z-10 w-full max-w-xl font-sans text-sm lg:flex-col">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 lg:text-5xl">
            AI Interview Coach
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Upload your resume and get ready to ace your next interview with personalized AI-generated questions.
          </p>
        </div>

        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle>Upload Resume</CardTitle>
            <CardDescription>Supported formats: PDF, TXT</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <div
                className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors ${file ? "border-primary bg-primary/5" : "border-slate-200 hover:bg-slate-50"
                  }`}
              >
                {file ? (
                  <div className="flex flex-col items-center text-center">
                    <CheckCircle className="mb-2 h-10 w-10 text-green-500" />
                    <p className="text-sm font-medium text-slate-900">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
                      className="mt-2 text-destructive hover:text-destructive"
                      disabled={loading}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="mb-4 h-10 w-10 text-slate-400" />
                    <p className="mb-1 text-sm font-medium text-slate-900">
                      Drag & drop or click to upload
                    </p>
                    <p className="text-xs text-slate-500">PDF or TXT up to 5MB</p>
                    <Input
                      id="resume"
                      type="file"
                      accept=".pdf,.txt"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => document.getElementById("resume")?.click()}
                    >
                      Select File
                    </Button>
                  </>
                )}
              </div>
            </div>

            {loading && (
              <div className="space-y-1">
                <Progress value={progress} className="h-2" />
                <p className="text-center text-xs text-slate-500">Parsing your resume...</p>
              </div>
            )}

            {error && (
              <div className="flex items-center space-x-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <p>{error}</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleUpload}
              disabled={!file || loading}
            >
              {loading ? "Analyzing..." : "Start Interview"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
