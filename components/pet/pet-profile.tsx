"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, MapPin, Share2, ArrowLeft, Check, Phone, Mail } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/providers/auth-provider"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

interface PetProfileProps {
  id: string
}

export function PetProfile({ id }: PetProfileProps) {
  const { user, token, isLoading: isAuthLoading } = useAuth()
  const isAdmin = user?.role === 'admin'
  const showCompatibility = !isAdmin
  const router = useRouter()
  const [pet, setPet] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isAdopting, setIsAdopting] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)

  // Visit scheduling state
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false)
  const [isScheduling, setIsScheduling] = useState(false)
  const [visitForm, setVisitForm] = useState({
    date: "",
    time: "",
    contact: user?.phone_number || "",
    notes: ""
  })

  // Message state
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [messageForm, setMessageForm] = useState({ subject: "", message: "" })

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/pets/${id}`)
        const data = await res.json()
        if (data.success) {
          setPet(data.pet)
        } else {
          toast.error("Pet not found")
        }
      } catch (err) {
        console.error("Fetch error:", err)
        toast.error("Failed to load pet details")
      } finally {
        setLoading(false)
      }
    }
    fetchPet()
  }, [id])

  // Sync contact info when user changes
  useEffect(() => {
    setVisitForm(prev => ({ ...prev, contact: user?.phone_number || "" }))
  }, [user])

  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!user || !pet) return
      try {
        const res = await fetch("http://localhost:5000/api/adoptions/me", {
          headers: { "x-auth-token": token || "" }
        })
        const data = await res.json()
        if (data.success) {
          const applied = data.adoptions.some((a: any) => a.pet_id === pet.id)
          setHasApplied(applied)
        }
      } catch (e) { console.error(e) }
    }
    checkApplicationStatus()
  }, [user, pet, token])

  const handleStartAdoption = async () => {
    if (!user) {
      toast.error("Please sign in to start the adoption process")
      router.push("/login")
      return
    }

    setIsAdopting(true)
    try {
      const res = await fetch("http://localhost:5000/api/adopt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token || ""
        },
        body: JSON.stringify({
          petId: pet.id,
          userId: user.id
        })
      })

      const data = await res.json()
      if (data.success) {
        toast.success(pet.is_foster
          ? `Foster trial started! ${pet.name} is ready for their 14-day stay.`
          : `Application submitted! The shelter will review your profile and contact you.`)
        setHasApplied(true)
        setIsConfirmModalOpen(false)
        router.push("/profile")
      } else {
        toast.error(data.error || "Failed to submit application")
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsAdopting(false)
    }
  }

  const handleScheduleVisit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error("Please sign in to schedule a visit")
      router.push("/login")
      return
    }

    setIsScheduling(true)
    try {
      const res = await fetch("http://localhost:5000/api/visits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token || ""
        },
        body: JSON.stringify({
          petId: pet.id,
          userId: user.id,
          date: visitForm.date,
          time: visitForm.time,
          contact: visitForm.contact,
          notes: visitForm.notes
        })
      })

      const data = await res.json()
      if (data.success) {
        toast.success("Visit scheduled! The shelter has been notified.")
        setIsVisitModalOpen(false)
      } else {
        toast.error(data.error || "Failed to schedule visit")
      }
    } catch (error) {
      toast.error("An error occurred while scheduling")
    } finally {
      setIsScheduling(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error("Please sign in to send a message")
      router.push("/login")
      return
    }

    setIsSendingMessage(true)
    try {
      const res = await fetch("http://localhost:5000/api/shelter/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token || ""
        },
        body: JSON.stringify({
          petId: pet.id,
          subject: messageForm.subject,
          message: messageForm.message
        })
      })

      const data = await res.json()
      if (data.success) {
        toast.success("Message sent to shelter")
        setIsMessageModalOpen(false)
        setMessageForm({ subject: "", message: "" })
      } else {
        toast.error(data.error || "Failed to send message")
      }
    } catch (err) {
      toast.error("An error occurred")
    } finally {
      setIsSendingMessage(false)
    }
  }

  if (loading) return <div className="py-20 text-center">Loading pet details...</div>
  if (!pet) return <div className="py-20 text-center">Pet not found (ID: {id})</div>

  // Try to get match info from localStorage
  let matchInfo = { compatibility: 0, reasons: [] }

  // Only calculate if auth is settled to avoid flashes
  if (!isAuthLoading) {
    const storedUserId = localStorage.getItem('pawmatch_quiz_user_id') || '';
    const currentUserId = user ? user.id.toString() : '';
    const canShowCompatibility = storedUserId === currentUserId;

    if (canShowCompatibility) {
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('pawmatch_matches')
          const timestamp = localStorage.getItem('pawmatch_quiz_timestamp')
          const oneHourInMs = 60 * 60 * 1000

          const isExpired = !timestamp || (Date.now() - parseInt(timestamp) > oneHourInMs)

          if (stored && !isExpired) {
            const matches = JSON.parse(stored)
            const found = matches.find((m: any) => m.id === pet.id)
            if (found) {
              matchInfo = {
                compatibility: found.matchScore || found.compatibility || 0,
                reasons: found.matchReasons || found.reasons || []
              }
            }
          }
        }
      } catch (e) {
        console.error("Local storage error", e)
      }
    }
  }

  const images = pet.image_url ? [pet.image_url] : ["/placeholder.svg?height=600&width=600"]

  // Map DB fields to UI expectations (with fallbacks)
  let temperament = pet.temperament || {}
  try {
    if (typeof pet.temperament === 'string') temperament = JSON.parse(pet.temperament)
  } catch (e) { }

  const traits = Array.isArray(temperament) ? temperament : (temperament.tags || ["Friendly", "Playful"])

  let socialProfile = pet.social_profile || {}
  try {
    if (typeof pet.social_profile === 'string') socialProfile = JSON.parse(pet.social_profile)
  } catch (e) { }

  // Map DB fields to UI expectations (with fallbacks)
  const displayData = {
    ...pet,
    compatibility: matchInfo.compatibility,
    matchReasons: matchInfo.reasons,
    images: images,
    traits: traits,
    stats: {
      energyLevel: (parseInt(pet.energy_level) || 5) * 10,
      friendliness: 90,
      cuddleFactor: (temperament.cuddle_factor || 5) * 10,
    },
    healthStatus: {
      vaccinated: !!pet.is_vaccinated,
      neutered: !!pet.is_neutered,
      microchipped: !!pet.is_microchipped,
      healthChecked: !!pet.is_health_checked
    },
    compatibilityBreakdown: [
      {
        label: "Lifestyle Fit",
        score: matchInfo.compatibility,
        description: matchInfo.reasons[0] || "Matches your general lifestyle needs"
      },
      {
        label: "Environment",
        score: Math.min(100, Math.round(matchInfo.compatibility * 1.05)),
        description: matchInfo.reasons[1] || "Well-suited for your living situation"
      },
      {
        label: "Social Compatibility",
        score: Math.min(100, Math.round(matchInfo.compatibility * 0.95)),
        description: matchInfo.reasons[2] || "Good behavioral match for your household"
      }
    ],
    shelter: {
      name: pet.shelter_name || "PawMatch Partner Shelter",
      phone: pet.shelter_phone || "+94 11 234 5678",
      email: pet.shelter_email || "adopt@pawmatch.lk",
      address: pet.shelter_address || "PawMatch Verified Location",
    }
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/matches"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to matches
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
              <img
                src={displayData.images[selectedImage] || "/placeholder.svg"}
                alt={displayData.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {displayData.images.map((img: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    "aspect-square rounded-xl overflow-hidden border-2 transition-all",
                    selectedImage === index ? "border-primary" : "border-transparent",
                  )}
                >
                  <img
                    src={img || "/placeholder.svg"}
                    alt={`${displayData.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">{displayData.name}</h1>
                  {showCompatibility && (
                    <Badge className="bg-accent text-accent-foreground text-sm">{displayData.compatibility}% Match</Badge>
                  )}
                  {displayData.status === 'adopted' && (
                    <Badge variant="outline" className="text-green-600 border-green-600 font-bold ml-2">ADOPTED</Badge>
                  )}
                </div>
                <p className="text-lg text-muted-foreground">{displayData.breed}</p>
              </div>
              <div className="flex items-center gap-2">
                {!isAdmin && (
                  <Button variant="outline" size="icon" onClick={() => setIsFavorite(!isFavorite)}>
                    <Heart className={cn("w-5 h-5", isFavorite && "fill-primary text-primary")} />
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-muted p-4 rounded-xl text-center">
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="font-semibold text-foreground">{displayData.age}</p>
              </div>
              <div className="bg-muted p-4 rounded-xl text-center">
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-semibold text-foreground">{displayData.gender}</p>
              </div>
              <div className="bg-muted p-4 rounded-xl text-center">
                <p className="text-sm text-muted-foreground">Weight</p>
                <p className="font-semibold text-foreground">{displayData.weight || 'N/A'}</p>
              </div>
              <div className="bg-muted p-4 rounded-xl text-center">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-semibold text-foreground text-sm uppercase">{displayData.status}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {Object.entries(displayData.healthStatus).map(([key, value]) => (
                <Badge
                  key={key}
                  variant={value ? "default" : "secondary"}
                  className={cn((value as boolean) && "bg-accent text-accent-foreground")}
                >
                  {(value as boolean) && <Check className="w-3 h-3 mr-1" />}
                  {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                </Badge>
              ))}
            </div>

            <Tabs defaultValue={showCompatibility ? "compatibility" : "story"} className="w-full">
              <TabsList className={cn("grid w-full", showCompatibility ? "grid-cols-3" : "grid-cols-2")}>
                {showCompatibility && <TabsTrigger value="compatibility">Compatibility</TabsTrigger>}
                <TabsTrigger value="story">Story</TabsTrigger>
                <TabsTrigger value="traits">Traits</TabsTrigger>
              </TabsList>

              {showCompatibility && (
                <TabsContent value="compatibility" className="space-y-4 mt-4">
                  {displayData.compatibilityBreakdown.map((item: any) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{item.label}</span>
                        <span className="text-sm text-primary font-semibold">{item.score}%</span>
                      </div>
                      <Progress value={item.score} className="h-2" />
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </TabsContent>
              )}

              <TabsContent value="story" className="mt-4">
                <p className="text-foreground leading-relaxed">{displayData.description || "No story available yet."}</p>
              </TabsContent>

              <TabsContent value="traits" className="space-y-6 mt-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {displayData.traits.map((trait: string, index: number) => (
                    <Badge key={`${trait}-${index}`} variant="secondary" className="px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20">
                      {trait}
                    </Badge>
                  ))}
                </div>

                <div className="grid gap-4">
                  {Object.entries(displayData.stats).map(([key, value]: [string, any]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">
                          {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                        </span>
                        <span className="text-sm text-muted-foreground">{value}%</span>
                      </div>
                      <Progress value={value} className="h-2" />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {!isAdmin && (
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={() => setIsConfirmModalOpen(true)}
                  disabled={isAdopting || displayData.status === 'adopted' || hasApplied}
                >
                  {displayData.status === 'adopted'
                    ? 'Already Adopted'
                    : hasApplied
                      ? 'Application Pending'
                      : displayData.is_foster
                        ? 'Start Fostering'
                        : 'Submit Adoption Application'}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => setIsVisitModalOpen(true)}
                >
                  Schedule a Visit
                </Button>
              </div>
            )}
            <div className="flex pt-2">
              <Button variant="ghost" className="w-full" onClick={() => setIsMessageModalOpen(true)}>
                <Mail className="w-4 h-4 mr-2" />
                Contact Shelter
              </Button>
            </div>
          </div>

          {/* Confirmation Dialogs - using displayData.name and displayData.status */}
          <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{displayData.is_foster ? 'Confirm Fostering' : 'Confirm Adoption'}</DialogTitle>
                <DialogDescription>
                  {displayData.is_foster
                    ? `Are you sure you want to start a 14-day foster trial for ${displayData.name}? We will support you every step of the way.`
                    : `Are you sure you want to submit an adoption application for ${displayData.name}? The shelter will review your profile compatibility.`}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>Cancel</Button>
                <Button onClick={handleStartAdoption} disabled={isAdopting}>
                  {isAdopting ? "Submitting..." : (displayData.is_foster ? "Confirm Foster" : "Submit Application")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isVisitModalOpen} onOpenChange={setIsVisitModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Schedule a Shelter Visit</DialogTitle>
                <DialogDescription>
                  Pick a date and time to meet {displayData.name} in person.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleScheduleVisit}>
                {/* ... same form as before ... */}
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right text-sm">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      className="col-span-3"
                      required
                      value={visitForm.date}
                      onChange={(e) => setVisitForm({ ...visitForm, date: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="time" className="text-right text-sm">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      className="col-span-3"
                      required
                      value={visitForm.time}
                      onChange={(e) => setVisitForm({ ...visitForm, time: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="contact" className="text-right text-sm">Contact Info</Label>
                    <Input
                      id="contact"
                      className="col-span-3"
                      required
                      placeholder="Your phone or email"
                      value={visitForm.contact}
                      onChange={(e) => setVisitForm({ ...visitForm, contact: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right text-sm">Notes</Label>
                    <Input
                      id="notes"
                      placeholder="Any specific questions?"
                      className="col-span-3"
                      value={visitForm.notes}
                      onChange={(e) => setVisitForm({ ...visitForm, notes: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsVisitModalOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isScheduling}>
                    {isScheduling ? "Scheduling..." : "Confirm Visit"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isMessageModalOpen} onOpenChange={setIsMessageModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Contact Shelter</DialogTitle>
                <DialogDescription>
                  Send a message to inquire about {pet?.name}.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={messageForm.subject}
                    onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                    placeholder="e.g. Question about adoption"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={messageForm.message}
                    onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                    placeholder="Write your message here..."
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsMessageModalOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSendingMessage}>
                    {isSendingMessage ? "Sending..." : "Send Message"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Shelter info */}
          <div className="bg-muted/50 border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">{displayData.shelter?.name || "Shelter Information"}</h3>
              <Button variant="link" className="p-0 h-auto text-primary" asChild>
                <Link href={`/shelter/${pet.shelter_id}`}>View Shelter Profile</Link>
              </Button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                {displayData.shelter?.phone || "Contact Info Unavailable"}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                {displayData.shelter?.email || "Email Unavailable"}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {displayData.shelter?.address || "Location Unavailable"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  )
}
