"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/ui/navigation"
import { Footer } from "@/components/ui/footer"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, BarChart, Bell, Dog, FileText, CheckCircle, AlertTriangle, Check } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/providers/auth-provider"

import { VerifyShelterCard } from "@/components/shelters/verify-shelter-card"

export default function ShelterDashboardPage() {
    const { user } = useAuth()
    const [verificationStatus, setVerificationStatus] = useState<string>('unverified')
    const [pets, setPets] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Sync validation status from user object or fetch fresh
    useEffect(() => {
        if (user?.verification_status) {
            setVerificationStatus(user.verification_status)
        }
    }, [user])

    const handleVerificationSubmitted = () => {
        setVerificationStatus('pending')
    }

    // Mock data for demo if backend not fully wired
    useEffect(() => {
        const fetchPets = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/pets');
                const data = await res.json();
                if (data.success) {
                    // In a real app, filter by shelter_id or use a specific endpoint
                    setPets(data.pets.slice(0, 5)); // Just showing some pets for demo
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPets();
    }, []);

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
                                <CardTitle className="text-sm font-medium">Total Pets</CardTitle>
                                <Dog className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{pets.length}</div>
                                <p className="text-xs text-muted-foreground">+2 from last month</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Matches</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">12</div>
                                <p className="text-xs text-muted-foreground">4 high compatibility</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Welfare Alerts</CardTitle>
                                <Bell className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">1</div>
                                <p className="text-xs text-muted-foreground text-destructive">Needs attention</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="pets" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="pets">My Pets</TabsTrigger>
                            <TabsTrigger value="matches">Matches & Applications</TabsTrigger>
                            <TabsTrigger value="welfare">Welfare Sentinel</TabsTrigger>
                        </TabsList>

                        <TabsContent value="pets" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle>Managed Pets</CardTitle>
                                            <CardDescription>
                                                Manage your pet profiles and update their status.
                                            </CardDescription>
                                        </div>
                                        {/* Placeholder for Toggle Switch - in real app would filter state */}
                                        <div className="flex items-center space-x-2 bg-muted p-1 rounded-lg">
                                            <Button size="sm" variant="secondary" className="shadow-sm">Available</Button>
                                            <Button size="sm" variant="ghost">Adopted</Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <div>Loading pets...</div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-4">
                                            {pets.map((pet) => (
                                                <div key={pet.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <img
                                                            src={pet.profile_image_url || "/placeholder.svg"}
                                                            alt={pet.name}
                                                            className="w-16 h-16 rounded-xl object-cover"
                                                        />
                                                        <div>
                                                            <div className="font-semibold text-lg">{pet.name}</div>
                                                            <div className="text-sm text-muted-foreground">{pet.breed} • {pet.age}</div>
                                                            <div className="flex gap-2 mt-1">
                                                                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">Energy: {pet.energy_level || 'N/A'}</span>
                                                                <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">Cuddle: {getCuddleFactor(pet.temperament)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${pet.status === 'Adopted' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                                                            {pet.status || 'Available'}
                                                        </span>
                                                        <Button variant="outline" size="sm">Edit Profile</Button>
                                                    </div>
                                                </div>
                                            ))}
                                            {pets.length === 0 && (
                                                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                                                    <div className="mb-4 text-muted-foreground">No pets listed yet.</div>
                                                    <Button asChild variant="outline">
                                                        <Link href="/shelters/add-pet">Add Your First Pet</Link>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="matches">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Applications</CardTitle>
                                    <CardDescription>
                                        Review high-compatibility matches and adoption requests.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Mock Data */}
                                        <div className="flex items-center justify-between p-4 border rounded-lg bg-accent/10 border-accent/20">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                    AP
                                                </div>
                                                <div>
                                                    <div className="font-semibold">Anil Perera</div>
                                                    <div className="text-sm text-muted-foreground">Matched with <span className="font-medium text-foreground">Bruno</span></div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className="font-bold text-green-600">95% Match</div>
                                                    <div className="text-xs text-muted-foreground">High Compatibility</div>
                                                </div>
                                                <Button size="sm">Review</Button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold">
                                                    SJ
                                                </div>
                                                <div>
                                                    <div className="font-semibold">Sarah Jones</div>
                                                    <div className="text-sm text-muted-foreground">Matched with <span className="font-medium text-foreground">Bella</span></div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className="font-bold text-yellow-600">72% Match</div>
                                                    <div className="text-xs text-muted-foreground">Moderate</div>
                                                </div>
                                                <Button size="sm" variant="outline">Review</Button>
                                            </div>
                                        </div>
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
                                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                    <td className="p-4 align-middle font-medium">Rocky</td>
                                                    <td className="p-4 align-middle">Kamal De Silva</td>
                                                    <td className="p-4 align-middle">2 days ago</td>
                                                    <td className="p-4 align-middle">
                                                        <Badge variant="destructive" className="flex w-fit items-center gap-1">
                                                            <AlertTriangle className="h-3 w-3" /> Flagged Risk
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 align-middle text-right">
                                                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">Contact</Button>
                                                    </td>
                                                </tr>
                                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                    <td className="p-4 align-middle font-medium">Luna</td>
                                                    <td className="p-4 align-middle">Nimali Perera</td>
                                                    <td className="p-4 align-middle">5 days ago</td>
                                                    <td className="p-4 align-middle">
                                                        <Badge variant="secondary" className="flex w-fit items-center gap-1 bg-green-100 text-green-800 hover:bg-green-100">
                                                            <Check className="h-3 w-3" /> Settling In
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 align-middle text-right">
                                                        <Button variant="ghost" size="sm">View Logs</Button>
                                                    </td>
                                                </tr>
                                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                    <td className="p-4 align-middle font-medium">Ginger</td>
                                                    <td className="p-4 align-middle">Hashan Cooray</td>
                                                    <td className="p-4 align-middle">12 days ago</td>
                                                    <td className="p-4 align-middle">
                                                        <Badge variant="secondary" className="flex w-fit items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-100">
                                                            <Check className="h-3 w-3" /> Settling In
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 align-middle text-right">
                                                        <Button variant="ghost" size="sm">View Logs</Button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
            <Footer />
        </div>
    )
}
