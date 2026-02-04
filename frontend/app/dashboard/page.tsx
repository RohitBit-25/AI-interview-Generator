"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { BarChart, Trophy, Target, ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
    const [stats, setStats] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
                const response = await axios.get(`${apiUrl}/api/dashboard`)
                setStats(response.data)
            } catch (error) {
                console.error("Error fetching dashboard:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    const averageScore = stats.length > 0
        ? (stats.reduce((acc, curr) => acc + (curr.rating || 0), 0) / stats.length).toFixed(1)
        : "0.0"

    return (
        <main className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="mx-auto max-w-4xl">
                <header className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-slate-900">Performance Dashboard</h1>
                    <Link href="/">
                        <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> New Interview</Button>
                    </Link>
                </header>

                <div className="mb-8 grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{averageScore}/10</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Skills Analyzed</CardTitle>
                            <BarChart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{new Set(stats.map((s: any) => s.topic)).size}</div>
                        </CardContent>
                    </Card>
                </div>

                <h2 className="mb-4 text-xl font-semibold text-slate-900">Recent Activity</h2>
                <div className="grid gap-4">
                    {stats.map((item: any, i: number) => (
                        <Card key={i}>
                            <CardHeader>
                                <CardTitle className="text-lg">{item.question}</CardTitle>
                                <div className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleString()}</div>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-2">
                                    <span className="font-semibold text-sm">Your Answer: </span>
                                    <span className="text-sm text-slate-700">{item.user_answer}</span>
                                </div>
                                <div>
                                    <span className="font-semibold text-sm">Rating: </span>
                                    <span className={`text-sm font-bold ${item.rating >= 7 ? 'text-green-600' : 'text-amber-600'}`}>{item.rating}/10</span>
                                </div>
                                <div className="mt-2 text-sm text-slate-600 bg-slate-100 p-2 rounded">
                                    {item.feedback}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {stats.length === 0 && !loading && (
                        <p className="text-center text-slate-500">No interview data available yet.</p>
                    )}
                </div>
            </div>
        </main>
    )
}
