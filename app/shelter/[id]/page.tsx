"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navigation } from "@/components/ui/navigation"
import { Footer } from "@/components/ui/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
    MapPin,
    Phone,
    Mail,
    Globe,
    Heart,
    CheckCircle2,
    ExternalLink,
    Instagram,
    Facebook,
    Twitter,
    Calendar
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function ShelterProfilePage() {
    const { id } = useParams()
    const [shelter, setShelter] = useState<any>(null)
    const [pets, setPets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchShelter = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/shelter/public/${id}`)
                const data = await res.json()
                if (data.success) {
                    setShelter(data.shelter)
                    setPets(data.pets)
                } else {
                    toast.error("Shelter not found")
                }
            } catch (err) {
                console.error("Fetch error:", err)
                toast.error("Failed to load shelter info")
            } finally {
                setLoading(false)
            }
        }
        fetchShelter()
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navigation />
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <Footer />
            </div>
        )
    }

    if (!shelter) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navigation />
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <h2 className="text-2xl font-bold mb-2">Shelter Not Found</h2>
                    <p className="text-muted-foreground mb-6">The shelter you are looking for does not exist or has been removed.</p>
                    <Button asChild>
                        <Link href="/">Back to Home</Link>
                    </Button>
                </div>
                <Footer />
            </div>
        )
    }

    const socialLinks = typeof shelter.shelter_social_links === 'string'
        ? JSON.parse(shelter.shelter_social_links || '{}')
        : (shelter.shelter_social_links || {})

    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            <main className="pt-16 pb-20">
                {/* Banner */}
                <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
                    <img
                        src={shelter.shelter_banner_url || "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&q=80&w=2000"}
                        alt={shelter.shelter_name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 text-white">
                        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end gap-6">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-white overflow-hidden bg-white shrink-0 shadow-xl">
                                <img
                                    src={shelter.shelter_logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(shelter.shelter_name)}&background=random&size=200`}
                                    alt="Logo"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl md:text-4xl font-bold">{shelter.shelter_name}</h1>
                                    {shelter.verification_status === 'verified' && (
                                        <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-none">
                                            <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-lg text-white/90 max-w-2xl italic font-medium">"{shelter.shelter_tagline || 'Compassionate care for every animal.'}"</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                    <div className="grid lg:grid-cols-12 gap-12">

                        {/* Left Column: Details */}
                        <div className="lg:col-span-8 space-y-10">

                            {/* About */}
                            <section>
                                <h2 className="text-2xl font-bold mb-4">About the Shelter</h2>
                                <div className="prose prose-neutral dark:prose-invert max-w-none">
                                    <p className="text-muted-foreground leading-relaxed text-lg">
                                        {shelter.shelter_description || `${shelter.shelter_name} is a dedicated animal welfare organization located in ${shelter.shelter_address}. Our mission is to provide a safe haven for animals in need and facilitate successful adoptions into loving forever homes.`}
                                    </p>
                                </div>
                            </section>

                            {/* Stats / Features */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Card className="p-4 text-center border-none bg-primary/5">
                                    <Heart className="w-6 h-6 text-primary mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-primary">{pets.length}</p>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Available Pets</p>
                                </Card>
                                <Card className="p-4 text-center border-none bg-orange-500/5">
                                    <Calendar className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-orange-500">10+</p>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Years Active</p>
                                </Card>
                                <Card className="p-4 text-center border-none bg-green-500/5">
                                    <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-green-500">500+</p>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Adoptions</p>
                                </Card>
                                <Card className="p-4 text-center border-none bg-indigo-500/5">
                                    <MapPin className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                                    <p className="text-lg font-bold text-indigo-500 truncate">{shelter.shelter_address.split(',')[0]}</p>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Location</p>
                                </Card>
                            </div>

                            {/* Available Pets Grid */}
                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold">Currently Available Pets</h2>
                                    <Button variant="ghost" asChild>
                                        <Link href="/matches?browse=all">View All <ExternalLink className="w-4 h-4 ml-2" /></Link>
                                    </Button>
                                </div>

                                {pets.length > 0 ? (
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        {pets.map((pet) => (
                                            <Card key={pet.id} className="overflow-hidden group hover:shadow-lg transition-all border-muted/30">
                                                <div className="relative aspect-[4/3] overflow-hidden">
                                                    <img
                                                        src={pet.image_url || "/placeholder.svg"}
                                                        alt={pet.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                    {pet.is_foster && (
                                                        <Badge className="absolute top-3 left-3 bg-orange-500 text-white border-none">Foster-to-Adopt</Badge>
                                                    )}
                                                </div>
                                                <div className="p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="text-lg font-bold text-foreground">{pet.name}</h3>
                                                        <Badge variant="outline">{pet.breed}</Badge>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                                        <span>{pet.age}</span>
                                                        <span>•</span>
                                                        <span>{pet.gender}</span>
                                                    </div>
                                                    <Button className="w-full" variant="outline" asChild>
                                                        <Link href={`/pet/${pet.id}`}>Meet {pet.name}</Link>
                                                    </Button>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed">
                                        <p className="text-muted-foreground">No pets currently listed for adoption.</p>
                                    </div>
                                )}
                            </section>

                        </div>

                        {/* Right Column: Contact & Sidebar */}
                        <div className="lg:col-span-4 space-y-6">

                            <Card className="p-6 sticky top-24 border-muted/40 shadow-sm">
                                <h3 className="text-xl font-bold mb-6">Connect with Us</h3>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <MapPin className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">Visit Address</p>
                                            <p className="text-sm text-muted-foreground">{shelter.shelter_address}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <Phone className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">Phone Number</p>
                                            <p className="text-sm text-muted-foreground">{shelter.phone_number}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <Mail className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">Email Address</p>
                                            <p className="text-sm text-muted-foreground">{shelter.email}</p>
                                        </div>
                                    </div>

                                    {shelter.shelter_website && (
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                <Globe className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">Website</p>
                                                <a href={shelter.shelter_website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline transition-all">
                                                    {shelter.shelter_website.replace(/^https?:\/\//, '')}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    <hr className="border-muted/30" />

                                    <div className="flex items-center justify-center gap-4 py-2">
                                        {socialLinks.instagram && (
                                            <a href={socialLinks.instagram} className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-muted transition-colors">
                                                <Instagram className="w-5 h-5" />
                                            </a>
                                        )}
                                        {socialLinks.facebook && (
                                            <a href={socialLinks.facebook} className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-muted transition-colors">
                                                <Facebook className="w-5 h-5" />
                                            </a>
                                        )}
                                        {socialLinks.twitter && (
                                            <a href={socialLinks.twitter} className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-muted transition-colors">
                                                <Twitter className="w-5 h-5" />
                                            </a>
                                        )}
                                    </div>

                                </div>
                            </Card>

                            {/* Verified Badge Detail */}
                            <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-6 text-center">
                                <CheckCircle2 className="w-10 h-10 text-blue-500 mx-auto mb-3" />
                                <h4 className="font-bold text-foreground">PawMatch Verified</h4>
                                <p className="text-sm text-muted-foreground">This shelter has completed our identity verification and facility check process.</p>
                            </div>

                        </div>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
