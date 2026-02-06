"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { BarChart, Trophy, Target, ArrowLeft, Zap, Crown } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Legend
} from 'recharts'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

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

    // Prepare chart data (Mocking logic for topic distribution based on stats)
    // In real app, backend should aggregate this.
    const chartData = [
        { subject: 'Algorithms', A: 120, fullMark: 150 },
        { subject: 'System Design', A: 98, fullMark: 150 },
        { subject: 'Behavioral', A: 86, fullMark: 150 },
        { subject: 'Databases', A: 99, fullMark: 150 },
        { subject: 'Frontend', A: 85, fullMark: 150 },
        { subject: 'DevOps', A: 65, fullMark: 150 },
    ];

    return (
        <main className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="mx-auto max-w-6xl">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl font-bold text-slate-900 flex items-center gap-2"
                        >
                            <Trophy className="w-8 h-8 text-indigo-600" /> Command Center
                        </motion.h1>
                        <p className="text-slate-500 mt-1">Track your interview mastery.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-full border border-amber-200 text-amber-700 font-bold">
                            <Zap className="w-5 h-5 fill-amber-500 text-amber-500" />
                            <span>3 Day Streak</span>
                        </div>
                        <Link href="/">
                            <Button className="bg-slate-900 text-white"><ArrowLeft className="mr-2 h-4 w-4" /> New Session</Button>
                        </Link>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Key Metrics */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500 font-medium">Interview Readiness</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-bold text-slate-900">{averageScore}<span className="text-lg text-slate-400">/10</span></div>
                                    <Progress value={parseFloat(averageScore) * 10} className="h-2 mt-3 bg-indigo-100" />
                                </CardContent>
                            </Card>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500 font-medium">Questions Crushed</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-bold text-slate-900">{stats.length}</div>
                                    <p className="text-xs text-emerald-600 mt-2 flex items-center"><Crown className="w-3 h-3 mr-1" /> Top 5% of candidates</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Radar Chart */}
                    <Card className="md:col-span-2 shadow-sm">
                        <CardHeader>
                            <CardTitle>Skill Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                    <PolarGrid stroke="#e2e8f0" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                    <Radar
                                        name="My Skills"
                                        dataKey="A"
                                        stroke="#4f46e5"
                                        fill="#4f46e5"
                                        fillOpacity={0.3}
                                    />
                                    <Legend />
                                </RadarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                <h2 className="mb-4 text-xl font-semibold text-slate-900">Recent Activity Log</h2>
                <div className="grid gap-4">
                    {stats.map((item: any, i: number) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="hover:border-indigo-200 transition-colors cursor-default">
                                <CardContent className="p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full uppercase font-bold tracking-wide">{item.topic || 'General'}</span>
                                            <span className="text-xs text-slate-400">{new Date(item.timestamp).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="text-lg font-medium text-slate-900 mb-1">"{item.question}"</h3>
                                        <p className="text-sm text-slate-500 line-clamp-1">{item.feedback}</p>
                                    </div>

                                    <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl ${item.rating >= 7 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                        <span className="text-xl font-bold">{item.rating}</span>
                                        <span className="text-[10px] uppercase font-bold">Score</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                    {stats.length === 0 && !loading && (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                            <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">No data found. Start your first interview!</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
