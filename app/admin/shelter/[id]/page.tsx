"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    Users,
    Heart,
    Clock,
    Eye,
    AlertTriangle,
    CheckCircle2
} from "lucide-react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    Legend,
    PieChart,
    Pie,
    Cell
} from "recharts"

export default function ShelterAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { token, user } = useAuth()
    const router = useRouter()
    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const COLORS = ['#D34518', '#ef4444', '#f97316', '#fbbf24']

    useEffect(() => {
        if (!token) return

        const fetchAnalytics = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/admin/analytics/shelter/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                const result = await res.json()
                if (result.success) {
                    setData(result)
                } else {
                    setError(result.details || result.error || "Unknown error")
                }
            } catch (error: any) {
                console.error("Failed to fetch analytics:", error)
                setError(error.message)
            } finally {
                setIsLoading(false)
            }
        }

        fetchAnalytics()
    }, [id, token])

    if (isLoading) return <div className="p-8 text-center">Loading Analytics...</div>
    if (error || !data) return (
        <div className="p-8 text-center space-y-4">
            <div className="text-destructive font-bold">Failed to load analytics data.</div>
            <div className="text-xs text-muted-foreground font-mono bg-muted p-4 rounded max-w-md mx-auto">
                {error || "No data received from server"}
            </div>
            <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
    )

    return (
        <div className="min-h-screen bg-muted/30 p-4 md:p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{data.shelter.shelter_name}</h1>
                        <p className="text-muted-foreground">Comprehensive Performance & Health Analytics</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Download Report</Button>
                    <Button className="bg-[#D34518] hover:bg-[#D34518]/90">Update Goals</Button>
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Adoption Rate"
                    value={`${data.kpis.adoptionRate.value}%`}
                    trend={data.kpis.adoptionRate.trend}
                    icon={<Heart className="w-5 h-5 text-red-500" />}
                    description="vs last 30 days"
                />
                <KPICard
                    title="Avg. Stay (ALOS)"
                    value={`${data.kpis.alos.value} Days`}
                    trend={data.kpis.alos.trend}
                    trendInverted
                    icon={<Clock className="w-5 h-5 text-blue-500" />}
                    description="Time to adoption"
                />
                <KPICard
                    title="Pending Apps"
                    value={data.kpis.pendingApplications.value}
                    trend={data.kpis.pendingApplications.trend}
                    icon={<Users className="w-5 h-5 text-amber-500" />}
                    description="Awaiting review"
                />
                <KPICard
                    title="Profile Views"
                    value={data.kpis.profileViews.value.toLocaleString()}
                    trend={data.kpis.profileViews.trend}
                    icon={<Eye className="w-5 h-5 text-primary" />}
                    description="Total engagement"
                />
            </div>

            {/* Foster Intelligence Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Foster Success"
                    value={data.kpis.fosterSuccess.value}
                    trend={data.kpis.fosterSuccess.trend}
                    icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
                    description="Move to adoption"
                />
                <KPICard
                    title="Active Fosters"
                    value={data.kpis.activeFosters.value}
                    trend={data.kpis.activeFosters.trend}
                    icon={<Users className="w-5 h-5 text-indigo-500" />}
                    description="Pets in trial homes"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Adoption Funnel */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Adoption Funnel Efficiency</CardTitle>
                        <CardDescription>User journey from profile view to final adoption</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.charts.funnel} layout="vertical" margin={{ left: 40, right: 40 }}>
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="stage" width={100} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#D34518" radius={[0, 4, 4, 0]} label={{ position: 'right' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Demographics */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pet Demographics</CardTitle>
                        <CardDescription>Species & Age Breakdown</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex flex-col items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.charts.demographics.species}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.charts.demographics.species.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Foster Outcome Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Foster Outcome Breakdown</CardTitle>
                        <CardDescription>Results of completed foster trials</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex flex-col items-center">
                        {data.charts.fosterOutcomes.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.charts.fosterOutcomes}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        nameKey="label"
                                    >
                                        {data.charts.fosterOutcomes.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => [`${value} Pets`, 'Count']} />
                                    <Legend formatter={(value) => value.split('_').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                                No completed foster trials yet.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Intake vs Outcome */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Intake vs. Outcome Trend</CardTitle>
                        <CardDescription>6-Month flow balancing new intake with adoptions</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.charts.intakeVsOutcome}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="intake" stroke="#f97316" strokeWidth={2} />
                                <Line type="monotone" dataKey="outcome" stroke="#D34518" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Operational Health */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Response Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5" />
                                {data.operational.avgResponseTime}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 text-balance">Excellent! Faster than 80% of shelters.</p>
                        </CardContent>
                    </Card>

                    <Card className="border-red-200">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm">Long-Stay Alert</CardTitle>
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 pt-2">
                                {data.operational.longStayAlerts.map((pet: any) => (
                                    <div key={pet.id} className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
                                            {pet.image_url ? <img src={pet.image_url} alt="" className="w-full h-full object-cover" /> : <div className="bg-primary/20 w-full h-full" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{pet.name}</p>
                                            <p className="text-xs text-red-600 font-bold">{pet.days} Days in Care</p>
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold text-[#D34518]">Promote</Button>
                                    </div>
                                ))}
                                {data.operational.longStayAlerts.length === 0 && (
                                    <p className="text-xs text-muted-foreground text-center py-4">No pets currently in long-stay.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function KPICard({ title, value, trend, icon, description, trendInverted = false }: any) {
    const isPositive = trend > 0
    const isGood = trendInverted ? !isPositive : isPositive
    const TrendIcon = isPositive ? TrendingUp : TrendingDown

    return (
        <Card className="bg-white">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    {icon}
                </div>
                <div>
                    <div className="text-2xl font-bold">{value}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                        <div className={`flex items-center text-xs font-medium ${isGood ? 'text-green-600' : 'text-red-600'}`}>
                            <TrendIcon className="w-3.5 h-3.5 mr-0.5" />
                            {Math.abs(trend)}%
                        </div>
                        <span className="text-[10px] text-muted-foreground">{description}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
