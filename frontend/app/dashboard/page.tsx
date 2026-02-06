"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { BarChart, Trophy, Target, ArrowLeft, Zap, Crown, Terminal, Activity } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Legend,
    Tooltip
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

    // Mock data for charts - in real app, aggregate from stats
    const chartData = [
        { subject: 'Algorithms', A: 120, fullMark: 150 },
        { subject: 'System Design', A: 98, fullMark: 150 },
        { subject: 'Behavioral', A: 86, fullMark: 150 },
        { subject: 'Databases', A: 99, fullMark: 150 },
        { subject: 'Frontend', A: 85, fullMark: 150 },
        { subject: 'DevOps', A: 65, fullMark: 150 },
    ];

    return (
        <main className="min-h-screen bg-[#050a14] p-4 md:p-8 relative overflow-hidden font-sans text-cyan-50">
            {/* Cyber Background */}
            <div className="absolute inset-0 bg-cyber-grid z-0 opacity-20 pointer-events-none" />

            <div className="mx-auto max-w-7xl relative z-10">
                <header className="mb-12 flex items-center justify-between border-b border-cyan-900/50 pb-6">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-4xl font-bold text-white font-orbitron tracking-widest flex items-center gap-3"
                        >
                            <Terminal className="w-8 h-8 text-cyan-500" />
                            COMMAND_CENTER
                        </motion.h1>
                        <p className="text-cyan-600/80 mt-2 font-mono tracking-wider ml-1">OPERATIVE_STATUS: ONLINE // TRACKING_MASTERY</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 bg-[#ffe600]/10 px-4 py-2 border border-[#ffe600]/50 text-[#ffe600] font-mono font-bold tracking-widest clip-path-slant">
                            <Zap className="w-4 h-4 fill-[#ffe600]" />
                            <span>STREAK: 3_DAYS</span>
                        </div>
                        <Link href="/">
                            <Button className="bg-cyan-950 text-cyan-400 border border-cyan-500 hover:bg-cyan-900 font-orbitron tracking-wide rounded-none h-10 px-6">
                                <ArrowLeft className="mr-2 h-4 w-4" /> NEW_SESSION
                            </Button>
                        </Link>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {/* Key Metrics */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="bg-[#0a0f1e]/80 backdrop-blur-md border border-cyan-500/30 rounded-none relative overflow-hidden group hover:border-cyan-400 transition-colors">
                                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-cyan-600 font-mono tracking-widest uppercase">Readiness_Index</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-end gap-2">
                                        <div className="text-5xl font-bold text-white font-orbitron text-glow-cyan">{averageScore}</div>
                                        <span className="text-xl text-cyan-700 font-mono mb-2">/10</span>
                                    </div>
                                    <Progress value={parseFloat(averageScore) * 10} className="h-1 mt-4 bg-cyan-950" />
                                </CardContent>
                            </Card>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="bg-[#0a0f1e]/80 backdrop-blur-md border border-purple-500/30 rounded-none relative overflow-hidden group hover:border-purple-400 transition-colors">
                                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-purple-400 font-mono tracking-widest uppercase">Missions_Completed</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-5xl font-bold text-white font-orbitron text-glow-purple">{stats.length}</div>
                                    <p className="text-xs text-purple-300/70 mt-3 flex items-center font-mono">
                                        <Crown className="w-3 h-3 mr-1 text-purple-400" /> ELITE_TIER (TOP 5%)
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Radar Chart */}
                    <Card className="md:col-span-2 bg-[#0a0f1e]/80 backdrop-blur-md border border-cyan-900 rounded-none shadow-[0_0_30px_rgba(0,243,255,0.05)]">
                        <CardHeader className="border-b border-cyan-900/30">
                            <CardTitle className="text-cyan-400 font-orbitron tracking-widest flex items-center gap-2">
                                <Activity className="w-5 h-5" /> SKILL_MATRIX_ANALYSIS
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[350px] p-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#06b6d4', fontSize: 12, fontFamily: 'monospace' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Current Capability"
                                        dataKey="A"
                                        stroke="#00f3ff"
                                        strokeWidth={2}
                                        fill="#00f3ff"
                                        fillOpacity={0.15}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#050a14', borderColor: '#00f3ff', color: '#fff' }}
                                        itemStyle={{ color: '#00f3ff' }}
                                    />
                                    <Legend wrapperStyle={{ fontFamily: 'monospace', color: '#94a3b8' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-2xl font-bold text-white font-orbitron tracking-wide">QUICK_ACCESS</h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-cyan-900 to-transparent" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <Link href="/arena">
                        <Card className="bg-[#0a0f1e]/40 border border-cyan-900/30 hover:bg-[#0a0f1e]/80 hover:border-cyan-500/50 transition-all rounded-none group cursor-pointer h-full">
                            <CardContent className="p-6 flex items-center gap-6 h-full">
                                <div className="p-4 bg-cyan-950/30 border border-cyan-500/30 rounded-none group-hover:bg-cyan-950/50 transition-colors">
                                    <Terminal className="w-8 h-8 text-cyan-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white font-orbitron tracking-wide mb-1 group-hover:text-cyan-300 transition-colors">CODING_ARENA</h3>
                                    <p className="text-sm text-cyan-100/60 font-mono">Launch standalone coding sandbox.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/quiz">
                        <Card className="bg-[#0a0f1e]/40 border border-purple-900/30 hover:bg-[#0a0f1e]/80 hover:border-purple-500/50 transition-all rounded-none group cursor-pointer h-full">
                            <CardContent className="p-6 flex items-center gap-6 h-full">
                                <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-none group-hover:bg-purple-950/50 transition-colors">
                                    <Activity className="w-8 h-8 text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white font-orbitron tracking-wide mb-1 group-hover:text-purple-300 transition-colors">SKILL_QUIZ</h3>
                                    <p className="text-sm text-purple-100/60 font-mono">Rapid-fire technical assessment.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-2xl font-bold text-white font-orbitron tracking-wide">MISSION_LOGS</h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-cyan-900 to-transparent" />
                </div>

                <div className="space-y-4 pb-12">
                    {stats.map((item: any, i: number) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Card className="bg-[#0a0f1e]/40 border border-cyan-900/30 hover:bg-[#0a0f1e]/80 hover:border-cyan-500/50 transition-all rounded-none group">
                                <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="bg-cyan-950/50 text-cyan-400 text-[10px] px-2 py-1 border border-cyan-900 uppercase font-mono tracking-wider">
                                                {item.topic || 'General_Protocol'}
                                            </span>
                                            <span className="text-xs text-cyan-800 font-mono">
                                                {new Date(item.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-200 mb-2 group-hover:text-cyan-300 transition-colors font-sans">
                                            "{item.question}"
                                        </h3>
                                        <p className="text-sm text-cyan-100/60 font-mono leading-relaxed border-l-2 border-cyan-900 pl-4">
                                            {item.feedback}
                                        </p>
                                    </div>

                                    <div className={`shrink-0 flex flex-col items-center justify-center w-20 h-20 border-2 ${item.rating >= 7
                                        ? 'bg-green-950/20 text-green-400 border-green-500/50'
                                        : 'bg-red-950/20 text-red-400 border-red-500/50'
                                        }`}>
                                        <span className="text-3xl font-bold font-orbitron">{item.rating}</span>
                                        <span className="text-[10px] uppercase font-bold tracking-widest opacity-70">PTS</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                    {stats.length === 0 && !loading && (
                        <div className="text-center py-20 bg-[#0a0f1e]/20 border border-dashed border-cyan-900">
                            <Target className="w-16 h-16 text-cyan-900 mx-auto mb-4" />
                            <p className="text-cyan-700 font-mono text-lg">NO_DATA_FOUND // INITIATE_FIRST_MISSION</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
