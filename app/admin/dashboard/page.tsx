"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/ui/navigation"
import { Footer } from "@/components/ui/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Check, X, FileText, MapPin, Building, Activity, AlertTriangle, Search } from "lucide-react"

export default function AdminDashboardPage() {
    // In real app, verify admin role in layout or middleware
    const [pendingShelters, setPendingShelters] = useState<any[]>([])
    const [selectedShelter, setSelectedShelter] = useState<any>(null)
    const [stats, setStats] = useState<any>({ totalShelters: 0, verifiedShelters: 0, totalAdoptions: 0, activeAlerts: 0 })
    const [isLoading, setIsLoading] = useState(true)

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const [sheltersRes, statsRes] = await Promise.all([
                fetch('http://localhost:5000/api/admin/pending-shelters'),
                fetch('http://localhost:5000/api/admin/stats')
            ])

            const sheltersData = await sheltersRes.json()
            const statsData = await statsRes.json()

            if (sheltersData.success) setPendingShelters(sheltersData.shelters)
            if (statsData.success) setStats(statsData.stats)

        } catch (error) {
            console.error("Admin dashboard fetch error", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleVerification = async (action: 'approve' | 'reject') => {
        if (!selectedShelter) return

        try {
            const res = await fetch('http://localhost:5000/api/admin/verify-shelter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Shelters</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalShelters}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Verified Shelters</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{stats.verifiedShelters}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Adoptions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-primary">{stats.totalAdoptions}</div>
                            </CardContent>
                        </Card>
                        <Card>
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
                                                    Format Check
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-lg">{selectedShelter.registration_number}</span>
                                                    {(selectedShelter.registration_number.startsWith('L-') || selectedShelter.registration_number.startsWith('FL-')) ? (
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
                                                <Button variant="outline" size="sm" className="bg-white" onClick={() => window.open(`https://www.google.com/maps/search/${selectedShelter.shelter_name}`, '_blank')}>
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
                                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 text-center text-muted-foreground">
                                    <Activity className="w-12 h-12 mb-4 opacity-20" />
                                    <h3 className="text-lg font-semibold">Ready for Review</h3>
                                    <p>Select a shelter from the queue to start verification.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
