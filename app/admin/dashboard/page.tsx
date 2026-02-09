"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/ui/navigation"
import { Footer } from "@/components/ui/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Check, X, FileText, MapPin, Building, Activity, AlertTriangle, Search, Truck, Bell, MoreHorizontal } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"

export default function AdminDashboardPage() {
    const router = useRouter()
    const { token, user, isLoading: authLoading } = useAuth()
    const [pendingShelters, setPendingShelters] = useState<any[]>([])
    const [allShelters, setAllShelters] = useState<any[]>([])
    const [adoptions, setAdoptions] = useState<any[]>([])
    const [selectedShelter, setSelectedShelter] = useState<any>(null)
    const [stats, setStats] = useState<any>({ totalShelters: 0, verifiedShelters: 0, totalAdoptions: 0, activeAlerts: 0 })
    const [alerts, setAlerts] = useState<any>({ welfareAlerts: [], animalReports: [] })
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("overview")

    // Auth guard
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login')
        } else if (!authLoading && user?.role !== 'admin') {
            router.push('/')
        }
    }, [user, authLoading, router])

    const fetchData = async () => {
        if (!token) return
        setIsLoading(true)
        try {
            const headers = { 'Authorization': `Bearer ${token}` }
            const [sheltersRes, statsRes, allSheltersRes, alertsRes, adoptionsRes] = await Promise.all([
                fetch('http://localhost:5000/api/admin/pending-shelters', { headers }),
                fetch('http://localhost:5000/api/admin/stats', { headers }),
                fetch('http://localhost:5000/api/admin/all-shelters', { headers }),
                fetch('http://localhost:5000/api/admin/alerts', { headers }),
                fetch('http://localhost:5000/api/admin/all-adoptions', { headers })
            ])

            const sheltersData = await sheltersRes.json()
            const statsData = await statsRes.json()
            const allSheltersData = await allSheltersRes.json()
            const alertsData = await alertsRes.json()
            const adoptionsData = await adoptionsRes.json()

            if (sheltersData.success) setPendingShelters(sheltersData.shelters)
            if (statsData.success) setStats(statsData.stats)
            if (allSheltersData.success) setAllShelters(allSheltersData.shelters)
            if (alertsData.success) setAlerts(alertsData)
            if (adoptionsData.success) setAdoptions(adoptionsData.adoptions)

        } catch (error) {
            console.error("Admin dashboard fetch error", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [token])

    const handleVerification = async (action: 'approve' | 'reject') => {
        if (!selectedShelter) return

        try {
            const res = await fetch('http://localhost:5000/api/admin/verify-shelter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    shelterId: selectedShelter.id,
                    action,
                    reason: action === 'reject' ? "Documents unclear" : "" // simplified for demo
                })
            })

            const data = await res.json()
            if (data.success) {
                alert(`Shelter ${action}ed successfully`)
                setSelectedShelter(null)
                fetchData() // refresh list
            }
        } catch (error) {
            console.error(error)
            alert("Action failed")
        }
    }

    const takeAction = async (reportId: number, action: string, shelterId?: number) => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/handle-report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ reportId, action, shelterId })
            })
            const data = await res.json()
            if (data.success) {
                alert(data.message)
                fetchData() // refresh
            }
        } catch (error) {
            console.error(error)
        }
    }

    const takeWelfareAction = async (logId: number, status: string, responseText?: string) => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/handle-welfare', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ logId, status, responseText })
            })
            const data = await res.json()
            if (data.success) {
                alert(data.message)
                fetchData()
            }
        } catch (error) {
            console.error(error)
        }
    }

    if (authLoading || (isLoading && !token)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/30">
                <div className="flex flex-col items-center gap-4">
                    <Activity className="w-12 h-12 text-primary animate-pulse" />
                    <p className="text-muted-foreground animate-pulse">Initializing Command Center...</p>
                </div>
            </div>
        )
    }

    if (!user || user.role !== 'admin') {
        return null
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <Navigation />
            <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground">Super Admin Command Center</h1>
                        <p className="text-muted-foreground">Platform Overview & Verification Workstation</p>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <Card
                            className="cursor-pointer hover:border-primary transition-colors"
                            onClick={() => setActiveTab("directory")}
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Shelters</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalShelters}</div>
                            </CardContent>
                        </Card>
                        <Card
                            className="cursor-pointer hover:border-green-500 transition-colors"
                            onClick={() => setActiveTab("directory")}
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Verified Shelters</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{stats.verifiedShelters}</div>
                            </CardContent>
                        </Card>
                        <Card
                            className="cursor-pointer hover:border-primary transition-colors"
                            onClick={() => setActiveTab("adoptions")}
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Adoptions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-primary">{stats.totalAdoptions}</div>
                            </CardContent>
                        </Card>
                        <Card
                            className="cursor-pointer hover:border-destructive transition-colors"
                            onClick={() => setActiveTab("alerts")}
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Active Alerts</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-destructive flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    {stats.activeAlerts}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="overview">Verification Workplace</TabsTrigger>
                            <TabsTrigger value="directory">Shelter Directory</TabsTrigger>
                            <TabsTrigger value="adoptions">Adoptions</TabsTrigger>
                            <TabsTrigger value="alerts">Alerts</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview">
                            <div className="grid lg:grid-cols-3 gap-8">
                                {/* Verification Queue (Left Col) */}
                                <Card className="lg:col-span-1 h-fit">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="w-5 h-5" />
                                            Verification Queue
                                        </CardTitle>
                                        <CardDescription>{pendingShelters.length} pending requests</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="divide-y max-h-[600px] overflow-y-auto">
                                            {pendingShelters.map((shelter) => (
                                                <button
                                                    key={shelter.id}
                                                    onClick={() => setSelectedShelter(shelter)}
                                                    className={`w-full text-left p-4 hover:bg-muted/50 transition-colors flex items-center justify-between ${selectedShelter?.id === shelter.id ? 'bg-muted border-l-4 border-l-primary' : ''}`}
                                                >
                                                    <div>
                                                        <div className="font-medium">{shelter.shelter_name}</div>
                                                        <div className="text-xs text-muted-foreground">{shelter.registry_type}</div>
                                                    </div>
                                                    <Badge variant="outline">Pending</Badge>
                                                </button>
                                            ))}
                                            {pendingShelters.length === 0 && (
                                                <div className="p-8 text-center text-muted-foreground text-sm">
                                                    No pending verifications
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Review Interface (Right Col - 2 cols wide) */}
                                <div className="lg:col-span-2">
                                    {selectedShelter ? (
                                        <Card className="h-full">
                                            <CardHeader className="bg-muted/30 border-b">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle className="text-2xl">{selectedShelter.shelter_name}</CardTitle>
                                                        <CardDescription className="flex items-center gap-2 mt-1">
                                                            <Building className="w-4 h-4" />
                                                            {selectedShelter.registry_type}
                                                        </CardDescription>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm text-muted-foreground">Submitted on</div>
                                                        <div className="font-medium">
                                                            {new Date(selectedShelter.created_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-6 space-y-8">

                                                {/* Smart Tools Bar */}
                                                <div className="flex flex-wrap gap-4 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                                                    <div className="flex-1 min-w-[200px]">
                                                        <div className="text-xs font-semibold text-blue-800 uppercase tracking-wide mb-1">
                                                            Platform IDs
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border">
                                                                <span className="text-[10px] text-muted-foreground font-bold">REG:</span>
                                                                <span className="font-mono text-sm">{selectedShelter.registration_number}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border">
                                                                <span className="text-[10px] bg-primary/10 text-primary px-1 rounded font-bold">CODE:</span>
                                                                <span className="font-mono text-sm font-bold">{selectedShelter.shelter_code}</span>
                                                            </div>
                                                            {(selectedShelter.registration_number?.startsWith('L-') || selectedShelter.registration_number?.startsWith('FL-')) ? (
                                                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Valid Format</Badge>
                                                            ) : (
                                                                <Badge variant="destructive" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none">Unusual Format</Badge>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" className="bg-white" onClick={() => window.open(`https://www.google.com/search?q=${selectedShelter.registration_number}+sri+lanka+ngo`, '_blank')}>
                                                            <Search className="w-4 h-4 mr-2" />
                                                            Search Database
                                                        </Button>
                                                        <Button variant="outline" size="sm" className="bg-white" onClick={() => window.open(`https://www.google.com/maps/search/${selectedShelter.shelter_name}+${selectedShelter.shelter_address || ''}`, '_blank')}>
                                                            <MapPin className="w-4 h-4 mr-2" />
                                                            Locate
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Document Viewer Split */}
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    <div className="border rounded-lg bg-muted/10 p-4 flex items-center justify-center min-h-[300px]">
                                                        {selectedShelter.verification_document_url ? (
                                                            <div className="text-center">
                                                                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                                                <p className="mb-4 text-sm text-muted-foreground">Document Uploaded</p>
                                                                <Button variant="outline" asChild>
                                                                    <a href={selectedShelter.verification_document_url} target="_blank" rel="noopener noreferrer">
                                                                        View Document
                                                                    </a>
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <div className="text-muted-foreground">No Document</div>
                                                        )}
                                                    </div>

                                                    <div className="space-y-4">
                                                        <h3 className="font-semibold text-lg">Applicant Details</h3>
                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                            <div>
                                                                <label className="text-muted-foreground block mb-1">Contact Person</label>
                                                                <div className="font-medium">{selectedShelter.name}</div>
                                                            </div>
                                                            <div>
                                                                <label className="text-muted-foreground block mb-1">Email</label>
                                                                <div className="font-medium">{selectedShelter.email}</div>
                                                            </div>
                                                            <div className="col-span-2">
                                                                <label className="text-muted-foreground block mb-1">Physical Address</label>
                                                                <div className="font-medium">{selectedShelter.shelter_address || "Not provided"}</div>
                                                            </div>
                                                        </div>

                                                        <div className="pt-8 space-y-3">
                                                            <Button
                                                                className="w-full bg-green-600 hover:bg-green-700"
                                                                size="lg"
                                                                onClick={() => handleVerification('approve')}
                                                            >
                                                                <Check className="w-4 h-4 mr-2" />
                                                                Approve Shelter
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                onClick={() => handleVerification('reject')}
                                                            >
                                                                <X className="w-4 h-4 mr-2" />
                                                                Reject Application
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>

                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 text-center text-muted-foreground">
                                            <Activity className="w-12 h-12 mb-4 opacity-20" />
                                            <h3 className="text-lg font-semibold">Ready for Review</h3>
                                            <p>Select a shelter from the queue to start verification.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="directory">
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle>Shelter Directory</CardTitle>
                                            <CardDescription>Manage and monitor all registered shelters (Verified & Pending)</CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm">Export CSV</Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                                                <tr>
                                                    <th className="px-4 py-3">Shelter</th>
                                                    <th className="px-4 py-3">ID Code</th>
                                                    <th className="px-4 py-3">Status</th>
                                                    <th className="px-4 py-3">Total Pets</th>
                                                    <th className="px-4 py-3">Active Adoptions</th>
                                                    <th className="px-4 py-3">Joined</th>
                                                    <th className="px-4 py-3 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {allShelters.map((s) => (
                                                    <tr key={s.id} className="hover:bg-muted/30">
                                                        <td className="px-4 py-4">
                                                            <div className="font-medium">{s.shelter_name}</div>
                                                            <div className="text-xs text-muted-foreground">{s.email}</div>
                                                        </td>
                                                        <td className="px-4 py-4 font-mono text-xs">{s.shelter_code}</td>
                                                        <td className="px-4 py-4">
                                                            <Badge variant={s.verification_status === 'verified' ? 'default' : s.verification_status === 'pending' ? 'outline' : 'destructive'} className={s.verification_status === 'verified' ? 'bg-green-100 text-green-800 hover:bg-green-100 border-none' : ''}>
                                                                {s.verification_status}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-4 text-center">{s.total_pets}</td>
                                                        <td className="px-4 py-4 text-center">{s.active_adoptions}</td>
                                                        <td className="px-4 py-4">{new Date(s.created_at).toLocaleDateString()}</td>
                                                        <td className="px-4 py-4 text-right">
                                                            <div className="flex gap-2 justify-end">
                                                                <Button variant="ghost" size="sm" className="text-[#D34518]" onClick={() => router.push(`/admin/shelter/${s.id}`)}>
                                                                    Analytics
                                                                </Button>
                                                                <Button variant="ghost" size="sm" onClick={() => window.open(`/shelter/${s.id}`, '_blank')}>View Profile</Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {allShelters.length === 0 && (
                                            <div className="py-20 text-center text-muted-foreground">
                                                No shelters registered yet.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="adoptions">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Platform Adoptions</CardTitle>
                                    <CardDescription>All successful pet adoptions across the network</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                                                <tr>
                                                    <th className="px-4 py-3">Pet</th>
                                                    <th className="px-4 py-3">Adopter</th>
                                                    <th className="px-4 py-3">Shelter</th>
                                                    <th className="px-4 py-3">Status</th>
                                                    <th className="px-4 py-3">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {adoptions.map((a) => (
                                                    <tr key={a.id} className="hover:bg-muted/30">
                                                        <td className="px-4 py-4">
                                                            <div className="flex items-center gap-3">
                                                                {a.pet_image && <img src={a.pet_image} className="w-8 h-8 rounded-full object-cover" alt="" />}
                                                                <span className="font-medium">{a.pet_name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="font-medium">{a.adopter_name}</div>
                                                            <div className="text-xs text-muted-foreground">{a.adopter_email}</div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="font-medium">{a.shelter_name}</div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">
                                                                {a.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            {new Date(a.adoption_date || a.created_at).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {adoptions.length === 0 && (
                                            <div className="py-20 text-center text-muted-foreground">
                                                No adoptions recorded yet.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="alerts">
                            <div className="space-y-6">
                                {/* Animal Reports Section */}
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle className="text-red-700">Crucial Animal Reports</CardTitle>
                                            <CardDescription>Public submissions regarding animals in distress</CardDescription>
                                        </div>
                                        <Badge variant="destructive">{alerts.animalReports.length} Active</Badge>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {alerts.animalReports.map((report: any) => (
                                                <div key={report.id} className="border-l-4 border-red-500 bg-red-50/30 p-4 rounded-r-lg space-y-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-red-900 uppercase text-xs px-1.5 py-0.5 bg-red-100 rounded">
                                                                    {report.condition_type}
                                                                </span>
                                                                <span className="font-medium text-foreground">{report.animal_type}</span>
                                                                {report.status !== 'pending' && (
                                                                    <Badge className="bg-blue-100 text-blue-800 border-none capitalize">{report.status.replace('_', ' ')}</Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-foreground">{report.description}</p>
                                                            <div className="flex gap-4 text-xs text-muted-foreground pt-2">
                                                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {report.location}</span>
                                                                <span className="flex items-center gap-1 font-medium text-foreground">Reporter: {report.contact_name} ({report.contact_phone})</span>
                                                                <span className="hidden sm:inline">{new Date(report.created_at).toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                        <Button variant="outline" size="sm" onClick={() => window.open(`https://www.google.com/maps/search/${report.location}`, '_blank')}>Map</Button>
                                                    </div>

                                                    {/* Quick Actions */}
                                                    <div className="flex flex-wrap gap-2 pt-2 border-t border-red-100">
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            className="h-8 bg-white border-red-200 text-red-700 hover:bg-red-50"
                                                            onClick={() => takeAction(report.id, 'dispatch')}
                                                            disabled={report.status === 'dispatching'}
                                                        >
                                                            <Truck className="w-3.5 h-3.5 mr-1.5" />
                                                            {report.status === 'dispatching' ? 'Team Engaged' : 'Dispatch Team'}
                                                        </Button>

                                                        {report.nearest_shelter ? (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 bg-white"
                                                                onClick={() => takeAction(report.id, 'notify', report.nearest_shelter.id)}
                                                            >
                                                                <Bell className="w-3.5 h-3.5 mr-1.5" />
                                                                Notify Nearest Shelter ({report.nearest_shelter.name} - {Math.round(report.nearest_shelter.distance)}km)
                                                            </Button>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground flex items-center px-3 italic">
                                                                No verified shelters nearby
                                                            </span>
                                                        )}

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 ml-auto text-green-700 hover:text-green-800 hover:bg-green-50"
                                                            onClick={() => takeAction(report.id, 'resolve')}
                                                        >
                                                            <Check className="w-3.5 h-3.5 mr-1.5" />
                                                            Mark Resolved
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            {alerts.animalReports.length === 0 && (
                                                <div className="py-12 text-center text-muted-foreground">
                                                    No pending public reports.
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Welfare Alerts Section */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-amber-700">Shelter Welfare Flags</CardTitle>
                                        <CardDescription>Automated risk flags from adoption logging</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {alerts.welfareAlerts.map((alert: any) => (
                                                <div key={alert.id} className={`border-l-4 ${alert.status === 'responded' ? 'border-green-500 bg-green-50/30' : 'border-red-600 bg-red-50/30'} p-4 rounded-r-lg space-y-3 shadow-sm`}>
                                                    <div className="flex justify-between items-start">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`font-bold uppercase text-[10px] px-1.5 py-0.5 rounded ${alert.status === 'responded' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
                                                                    {alert.status === 'responded' ? 'RESCUE VERIFIED' : 'URGENT: PENDING'}
                                                                </span>
                                                                <span className="font-bold text-foreground">PET WELFARE RISK: {alert.pet_name}</span>
                                                            </div>
                                                            <p className="text-sm font-semibold text-red-900">{alert.risk_reason}</p>
                                                            <p className="text-xs text-muted-foreground">Reported by shelter: <span className="font-medium">{alert.shelter_name}</span></p>

                                                            {alert.response_text ? (
                                                                <div className="mt-4 p-3 bg-white/80 rounded-lg border border-green-200 shadow-inner">
                                                                    <div className="flex items-center gap-2 mb-1 text-green-700 font-bold text-xs">
                                                                        <Check className="w-4 h-4" />
                                                                        SHELTER RESPONSE RECEIVED
                                                                    </div>
                                                                    <p className="text-sm text-foreground italic">"{alert.response_text}"</p>
                                                                </div>
                                                            ) : (
                                                                <div className="mt-4 p-3 bg-red-100/50 rounded-lg border border-red-200 border-dashed">
                                                                    <p className="text-xs text-red-700 font-medium flex items-center gap-1.5">
                                                                        <Activity className="w-3.5 h-3.5 animate-pulse" />
                                                                        Awaiting official clarification from shelter...
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] text-muted-foreground font-mono">{new Date(alert.created_at).toLocaleString()}</span>
                                                    </div>

                                                    <div className="flex gap-2 pt-2">
                                                        {alert.status !== 'responded' && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 text-xs bg-white border-red-200 hover:bg-red-50 text-red-700"
                                                                onClick={() => {
                                                                    const resp = prompt("As Admin, manually record a resolution/reply for this flag:")
                                                                    if (resp) takeWelfareAction(alert.id, 'responded', resp)
                                                                }}
                                                            >
                                                                Log Resolution
                                                            </Button>
                                                        )}
                                                        <Button variant="ghost" size="sm" className="h-8 text-xs ml-auto" onClick={() => takeWelfareAction(alert.id, alert.status === 'responded' ? 'pending' : 'responded')}>
                                                            Toggle Status
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            {alerts.welfareAlerts.length === 0 && (
                                                <div className="py-12 text-center text-muted-foreground text-sm">
                                                    <Activity className="w-12 h-12 mb-4 opacity-20 mx-auto" />
                                                    No pet welfare flags detected.
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
            <Footer />
        </div>
    )
}
