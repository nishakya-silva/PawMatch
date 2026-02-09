"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/ui/navigation"
import { Footer } from "@/components/ui/footer"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, BarChart, Bell, Dog, FileText, CheckCircle, AlertTriangle, Check, User, Phone } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/providers/auth-provider"

import { VerifyShelterCard } from "@/components/shelters/verify-shelter-card"
import { EditPetDialog } from "@/components/shelters/edit-pet-dialog"

export default function ShelterDashboardPage() {
    const { user, refreshUser, isLoading: authLoading } = useAuth()
    const router = useRouter()
    const [verificationStatus, setVerificationStatus] = useState<string>('unverified')
    const [pets, setPets] = useState<any[]>([])
    const [messages, setMessages] = useState<any[]>([])
    const [alerts, setAlerts] = useState<any[]>([])
    const [applications, setApplications] = useState<any[]>([])
    const [isApproving, setIsApproving] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isResponding, setIsResponding] = useState<number | null>(null)
    const [responseText, setResponseText] = useState("")

    // Edit state
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [selectedPet, setSelectedPet] = useState<any>(null)

    // Auth guard
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/shelters/signin')
        } else if (!authLoading && user?.role !== 'shelter') {
            router.push('/')
        }
    }, [user, authLoading, router])

    // Sync validation status from user object or fetch fresh
    useEffect(() => {
        if (user?.verification_status) {
            setVerificationStatus(user.verification_status)
        }
    }, [user])

    const handleVerificationSubmitted = () => {
        setVerificationStatus('pending')
    }

    const fetchPets = async () => {
        setIsLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            if (!token) return;
            const res = await fetch('http://localhost:5000/api/shelter/pets', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setPets(data.pets);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };


    // Mock data for demo if backend not fully wired
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) return;
                const res = await fetch('http://localhost:5000/api/shelter/messages', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setMessages(data.messages);
                }
            } catch (e) {
                console.error(e);
            }
        };

        const fetchAlerts = async () => {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) return;
                const res = await fetch('http://localhost:5000/api/welfare/shelter/alerts', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setAlerts(data.alerts);
                }
            } catch (e) {
                console.error(e);
            }
        };

        fetchPets();
        fetchMessages();
        fetchAlerts();
        fetchApplications();
    }, []);

    const handleEditPet = (pet: any) => {
        setSelectedPet(pet);
        setIsEditDialogOpen(true);
    };

    const handlePetUpdated = () => {
        fetchPets(); // Refresh list
    };

    const fetchApplications = async () => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) return;
            const res = await fetch('http://localhost:5000/api/shelter/applications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setApplications(data.applications);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleApproveAdoption = async (adoptionId: number) => {
        if (!confirm("Are you sure you want to approve this adoption? This will mark the pet as adopted.")) return;
        setIsApproving(adoptionId);
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/shelter/approve-adoption', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ adoptionId })
            });

            if (res.ok) {
                fetchApplications(); // refreshing lists
                fetchPets();
                if (refreshUser && user) {
                    refreshUser({ ...user, pending_applications: Math.max(0, (user.pending_applications || 0) - 1) })
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsApproving(null);
        }
    };

    const handleSendResponse = async (messageId: number) => {
        if (!responseText.trim()) return;
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/shelter/message/respond', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ messageId, response: responseText })
            });

            if (res.ok) {
                // Update local state
                setMessages(messages.map(m =>
                    m.id === messageId ? { ...m, response: responseText, responded_at: new Date().toISOString(), is_read: 1 } : m
                ));
                setIsResponding(null);
                setResponseText("");
                if (refreshUser && user) {
                    refreshUser({ ...user, unread_messages: Math.max(0, (user.unread_messages || 0) - 1) })
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Helper to safe parse temperament
    const getCuddleFactor = (temperament: any) => {
        if (!temperament) return 'N/A';
        try {
            // If it's already an object
            if (typeof temperament === 'object') return temperament.cuddle_factor || 'N/A';
            // If valid JSON string
            const parsed = JSON.parse(temperament);
            return parsed.cuddle_factor || 'N/A';
        } catch (e) {
            // Fallback for plain strings (legacy/mock data)
            return 'N/A';
        }
    }

    if (authLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-muted/30">Loading...</div>
    }

    if (!user || user.role !== 'shelter') {
        return null
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <Navigation />
            <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Shelter Dashboard</h1>
                            <p className="text-muted-foreground">
                                Welcome back, {user?.shelter_name || user?.name || "Partner"}
                            </p>
                        </div>
                        <Button asChild disabled={verificationStatus !== 'verified'}>
                            <Link href="/shelters/add-pet">
                                <Plus className="w-4 h-4 mr-2" />
                                Add New Pet
                            </Link>
                        </Button>
                    </div>

                    {/* Verification Section */}
                    {verificationStatus !== 'verified' && (
                        <div className="mb-8">
                            <VerifyShelterCard
                                status={verificationStatus}
                                userId={user?.id || 0}
                                onVerificationSubmitted={handleVerificationSubmitted}
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Animals in Care</CardTitle>
                                <Dog className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{pets.length}</div>
                                <p className="text-xs text-muted-foreground">Currently listed</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Adoption Requests</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{applications.length}</div>
                                <p className="text-xs text-muted-foreground">Active applications</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Security & Safety</CardTitle>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">All Good</div>
                                <p className="text-xs text-muted-foreground">No critical alerts</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="pets" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="applications" className="relative">
                                Applications
                                {applications.length > 0 && (
                                    <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                                        {applications.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="pets">Dogs in the Shelter</TabsTrigger>
                            <TabsTrigger value="messages" className="relative">
                                Messages
                                {messages.filter(m => !m.is_read).length > 0 && (
                                    <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                                        {messages.filter(m => !m.is_read).length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="welfare">Welfare sentinel</TabsTrigger>
                        </TabsList>

                        <TabsContent value="applications" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Adoption Applications</CardTitle>
                                    <CardDescription>Review pending adoption requests and applicant details.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {applications.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground">No pending applications.</div>
                                        ) : (
                                            applications.map((app) => (
                                                <div key={app.adoption_id} className="p-4 border rounded-lg flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-16 h-16 rounded-md overflow-hidden bg-muted">
                                                            <img src={app.pet_image || "/placeholder.jpg"} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-lg">{app.pet_name}</div>
                                                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                                <User className="w-3 h-3" /> Applicant: <span className="font-medium text-foreground">{app.user_name}</span>
                                                            </div>
                                                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                                <Phone className="w-3 h-3" /> {app.user_phone || "No phone provided"}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground mt-1">
                                                                Applied: {new Date(app.created_at).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={() => handleApproveAdoption(app.adoption_id)}
                                                            disabled={isApproving === app.adoption_id}
                                                            className="bg-green-600 hover:bg-green-700 shadow-md"
                                                        >
                                                            <CheckCircle className="w-4 h-4 mr-2" />
                                                            {isApproving === app.adoption_id ? "Approving..." : "Approve Adoption"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="pets" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle>Dogs in the Shelter</CardTitle>
                                            <CardDescription>
                                                Manage animal profiles, update health records, and shift status.
                                            </CardDescription>
                                        </div>
                                        {/* Placeholder for Toggle Switch */}
                                        <div className="flex items-center space-x-2 bg-muted p-1 rounded-lg">
                                            <Button size="sm" variant="secondary" className="shadow-sm">All</Button>
                                            <Button size="sm" variant="ghost">Adopted</Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <div className="text-center py-12">Checking records...</div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-4">
                                            {pets.map((pet) => (
                                                <div key={pet.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-accent/5 transition-all shadow-sm">
                                                    <div className="flex items-center gap-4">
                                                        <img
                                                            src={pet.image_url || "/placeholder.jpg"}
                                                            alt={pet.name}
                                                            className="w-20 h-20 rounded-xl object-cover border"
                                                        />
                                                        <div>
                                                            <div className="font-bold text-xl flex items-center gap-2">
                                                                {pet.name}
                                                                {pet.is_foster === 1 && <Badge variant="secondary" className="text-[10px] h-4">Foster</Badge>}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground font-medium">{pet.breed} • {pet.age}</div>
                                                            <div className="flex gap-2 mt-2">
                                                                <Badge variant="outline" className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 border-blue-200">Energy: {pet.energy_level || '5'}/10</Badge>
                                                                <Badge variant="outline" className="text-[10px] uppercase font-bold text-purple-600 bg-purple-50 border-purple-200">Cuddle: {getCuddleFactor(pet.temperament)}/10</Badge>
                                                                <Badge variant="outline" className={`text-[10px] uppercase font-bold ${pet.is_vaccinated ? 'text-green-600 bg-green-50 border-green-200' : 'text-amber-600 bg-amber-50 border-amber-200'}`}>
                                                                    {pet.is_vaccinated ? 'Vaccinated' : 'Unvaccinated'}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <span className={`px-4 py-1 text-xs rounded-full font-bold uppercase tracking-wider ${pet.status === 'adopted' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                                                            {pet.status || 'available'}
                                                        </span>
                                                        <Button onClick={() => handleEditPet(pet)} variant="outline" size="sm" className="font-semibold shadow-sm hover:bg-primary hover:text-white transition-colors">
                                                            Edit Profile
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            {pets.length === 0 && (
                                                <div className="text-center py-12 border-2 border-dashed rounded-2xl bg-muted/20">
                                                    <div className="mb-4 text-muted-foreground font-medium">Your shelter's directory is empty.</div>
                                                    <Button asChild className="shadow-lg">
                                                        <Link href="/shelters/add-pet">Add Your First Pet</Link>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>


                        <TabsContent value="messages">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Adopter Messages</CardTitle>
                                    <CardDescription>Direct inquiries from users regarding their adopted or matched pets.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {messages.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground">No messages found.</div>
                                        ) : (
                                            messages.map((msg) => (
                                                <div key={msg.id} className="p-4 border rounded-lg space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                                                {msg.pet_image ? (
                                                                    <img src={msg.pet_image} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <Dog className="w-5 h-5 text-muted-foreground" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-foreground">{msg.subject}</h4>
                                                                <p className="text-xs text-muted-foreground">From: {msg.user_name} • Re: {msg.pet_name} • {new Date(msg.created_at).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        {msg.responded_at ? (
                                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                                <CheckCircle className="w-3 h-3 mr-1" /> Responded
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                                                Pending Response
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-sm bg-muted/50 p-3 rounded-md italic">
                                                        "{msg.message}"
                                                    </div>

                                                    {msg.response ? (
                                                        <div className="text-sm border-l-4 border-primary pl-4 py-2 mt-4">
                                                            <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-1">Your Response:</p>
                                                            <p>{msg.response}</p>
                                                            <p className="text-[10px] text-muted-foreground mt-1">Responded on {new Date(msg.responded_at).toLocaleString()}</p>
                                                        </div>
                                                    ) : isResponding === msg.id ? (
                                                        <div className="space-y-3 pt-2">
                                                            <textarea
                                                                className="w-full min-h-[100px] p-3 text-sm rounded-md border focus:ring-2 focus:ring-primary focus:outline-none"
                                                                placeholder="Type your response here..."
                                                                value={responseText}
                                                                onChange={(e) => setResponseText(e.target.value)}
                                                            />
                                                            <div className="flex gap-2 justify-end">
                                                                <Button size="sm" variant="ghost" onClick={() => setIsResponding(null)}>Cancel</Button>
                                                                <Button size="sm" onClick={() => handleSendResponse(msg.id)}>Send Response</Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-end pt-2">
                                                            <Button size="sm" onClick={() => setIsResponding(msg.id)}>Respond</Button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="welfare">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Adoptions & Welfare Sentinel</CardTitle>
                                    <CardDescription>Monitor the settling-in process of recently adopted pets. Alerts are generated from adopter logs.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/50">
                                                <tr className="border-b transition-colors whitespace-nowrap">
                                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Pet Name</th>
                                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Adopter</th>
                                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Adoption Date</th>
                                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {alerts.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="p-8 text-center text-muted-foreground italic">
                                                            No critical welfare alerts at this time.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    alerts.map((alert) => (
                                                        <tr key={alert.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                            <td className="p-4 align-middle font-medium">{alert.pet_name}</td>
                                                            <td className="p-4 align-middle">{alert.adopter_name}</td>
                                                            <td className="p-4 align-middle">{new Date(alert.created_at).toLocaleDateString()}</td>
                                                            <td className="p-4 align-middle">
                                                                <div className="space-y-1">
                                                                    <Badge variant="destructive" className="flex w-fit items-center gap-1">
                                                                        <AlertTriangle className="h-3 w-3" /> Flagged Risk
                                                                    </Badge>
                                                                    <p className="text-[10px] text-destructive font-medium max-w-[200px] leading-tight">
                                                                        {alert.risk_reason}
                                                                    </p>
                                                                </div>
                                                            </td>
                                                            <td className="p-4 align-middle text-right">
                                                                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" asChild>
                                                                    <a href={`mailto:${alert.adopter_email}?subject=Welfare Concern regarding ${alert.pet_name}`}>
                                                                        Contact Adopter
                                                                    </a>
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
            <EditPetDialog
                pet={selectedPet}
                isOpen={isEditDialogOpen}
                onClose={() => setIsEditDialogOpen(false)}
                onUpdate={handlePetUpdated}
            />
            <Footer />
        </div>
    )
}
