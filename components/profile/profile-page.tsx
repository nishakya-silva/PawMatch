"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    User as UserIcon,
    Mail,
    Calendar,
    Phone,
    MapPin,
    Edit,
    Heart,
    TrendingUp,
    Award,
    PawPrint,
    Settings,
    Shield,
    Activity,
    Clock,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
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
import { toast } from "sonner"

interface Adoption {
    id: number
    petId: number
    petName: string
    petImage: string
    adoptionDate: string
    currentDay: number
    status: "active" | "completed" | "pending"
}

interface Visit {
    id: number
    pet_id: number
    pet_name: string
    visit_date: string
    visit_time: string
    notes: string
    status: string
}

interface UserStats {
    totalAdoptions: number
    activeAdoptions: number
    totalCheckIns: number
    currentStreak: number
    longestStreak: number
    memberSince: string
}

interface ActivityLog {
    id: number
    action_type: string
    details: any
    created_at: string
}

interface Achievement {
    type: string
    title: string
    description: string
    icon: string
    color: string
    achievedAt: string
}

export function ProfilePage() {
    const { user, token, refreshUser, isLoading } = useAuth()
    const router = useRouter()
    const [adoptions, setAdoptions] = useState<Adoption[]>([])
    const [stats, setStats] = useState<UserStats>({
        totalAdoptions: 0,
        activeAdoptions: 0,
        totalCheckIns: 0,
        currentStreak: 0,
        longestStreak: 0,
        memberSince: "2024",
    })
    const [loading, setLoading] = useState(true)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editForm, setEditForm] = useState({
        name: user?.name || "",
        phone_number: user?.phone_number || "",
    })
    const [isUpdating, setIsUpdating] = useState(false)
    const [logs, setLogs] = useState<ActivityLog[]>([])
    const [isLoadingLogs, setIsLoadingLogs] = useState(false)
    const [visits, setVisits] = useState<Visit[]>([])
    const [isLoadingVisits, setIsLoadingVisits] = useState(false)
    const [isEditVisitModalOpen, setIsEditVisitModalOpen] = useState(false)
    const [editingVisit, setEditingVisit] = useState<Visit | null>(null)
    const [visitForm, setVisitForm] = useState({
        date: "",
        time: "",
        notes: ""
    })
    const [achievements, setAchievements] = useState<Achievement[]>([])
    const [isLoadingAchievements, setIsLoadingAchievements] = useState(false)

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login")
            return
        }

        if (user) {
            fetchUserData()
            setEditForm({
                name: user.name,
                phone_number: user.phone_number || "",
            })
        }
    }, [user, isLoading, router])

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || !token) return

        setIsUpdating(true)
        try {
            const res = await fetch("http://localhost:5000/api/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": token,
                },
                body: JSON.stringify(editForm),
            })

            const data = await res.json()

            if (data.success) {
                refreshUser(data.user)
                toast.success("Profile updated successfully")
                setIsEditModalOpen(false)
            } else {
                toast.error(data.error || "Failed to update profile")
            }
        } catch (error) {
            console.error("Update profile error:", error)
            toast.error("An error occurred while updating your profile")
        } finally {
            setIsUpdating(false)
        }
    }

    const fetchActivityLogs = async () => {
        if (!token) return
        setIsLoadingLogs(true)
        try {
            const res = await fetch("http://localhost:5000/api/logs", {
                headers: { "x-auth-token": token }
            })
            const data = await res.json()
            if (data.success) {
                setLogs(data.logs)
            }
        } catch (error) {
            console.error("Failed to fetch logs:", error)
        } finally {
            setIsLoadingLogs(false)
        }
    }

    const fetchVisits = async () => {
        if (!token) return
        setIsLoadingVisits(true)
        try {
            const res = await fetch("http://localhost:5000/api/visits", {
                headers: { "x-auth-token": token }
            })
            const data = await res.json()
            if (data.success) {
                setVisits(data.visits)
            }
        } catch (error) {
            console.error("Failed to fetch visits:", error)
        } finally {
            setIsLoadingVisits(false)
        }
    }

    const fetchAchievements = async () => {
        if (!token) return
        setIsLoadingAchievements(true)
        try {
            const res = await fetch("http://localhost:5000/api/achievements", {
                headers: { "x-auth-token": token }
            })
            const data = await res.json()
            if (data.success) {
                setAchievements(data.achievements)
            }
        } catch (error) {
            console.error("Failed to fetch achievements:", error)
        } finally {
            setIsLoadingAchievements(false)
        }
    }

    const fetchUserData = async () => {
        if (!token) return
        try {
            const res = await fetch("http://localhost:5000/api/adoptions/me", {
                headers: { "x-auth-token": token }
            })
            const data = await res.json()

            if (data.success) {
                const mappedAdoptions = data.adoptions.map((a: any) => ({
                    id: a.id,
                    petId: a.pet_id,
                    petName: a.petName,
                    petImage: a.petImage || "/placeholder.svg",
                    adoptionDate: a.created_at,
                    currentDay: Math.floor((new Date().getTime() - new Date(a.created_at).getTime()) / (1000 * 3600 * 24)) + 1,
                    status: a.status,
                }))
                setAdoptions(mappedAdoptions)

                setStats(prev => ({
                    ...prev,
                    totalAdoptions: mappedAdoptions.length,
                    activeAdoptions: mappedAdoptions.length,
                    memberSince: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : prev.memberSince
                }))
            }

            // Fetch real logs and visits and achievements
            fetchActivityLogs()
            fetchVisits()
            fetchAchievements()
        } catch (error) {
            console.error("Failed to fetch user data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateVisit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token || !editingVisit) return

        try {
            const res = await fetch(`http://localhost:5000/api/visits/${editingVisit.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": token
                },
                body: JSON.stringify(visitForm)
            })
            const data = await res.json()
            if (data.success) {
                toast.success("Visit rescheduled successfully")
                setIsEditVisitModalOpen(false)
                fetchVisits()
            } else {
                toast.error(data.error || "Failed to update visit")
            }
        } catch (error) {
            toast.error("An error occurred while updating the visit")
        }
    }

    const handleCancelVisit = async (visitId: number) => {
        if (!token || !confirm("Are you sure you want to cancel this visit?")) return

        try {
            const res = await fetch(`http://localhost:5000/api/visits/${visitId}`, {
                method: "DELETE",
                headers: { "x-auth-token": token }
            })
            const data = await res.json()
            if (data.success) {
                toast.success("Visit cancelled successfully")
                fetchVisits()
            } else {
                toast.error(data.error || "Failed to cancel visit")
            }
        } catch (error) {
            toast.error("An error occurred while cancelling the visit")
        }
    }

    const getActivityMessage = (log: ActivityLog) => {
        switch (log.action_type) {
            case 'ADOPTION_APPLICATION':
                return "Submitted an adoption application"
            case 'VISIT_SCHEDULED':
                return `Scheduled a shelter visit for ${log.details?.date}`
            case 'PROFILE_UPDATE':
                return "Updated profile details"
            case 'PASSWORD_CHANGE':
                return "Changed account password"
            default:
                return log.action_type.replace(/_/g, ' ').toLowerCase()
        }
    }

    if (isLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    const userInitials = user.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U"

    return (
        <div className="min-h-screen bg-muted/30 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold">My Profile</h1>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column - Profile Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Profile Card */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center text-center">
                                    {/* Avatar */}
                                    <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold mb-4">
                                        {userInitials}
                                    </div>

                                    {/* User Info */}
                                    <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
                                    <p className="text-muted-foreground mb-4">{user.email}</p>

                                    <Badge className={cn("mb-6 gap-1", user.nic ? "bg-green-600 hover:bg-green-700" : "")}>
                                        <Shield className="w-3 h-3" />
                                        Verified Member {user.nic && " (ID Verified)"}
                                    </Badge>

                                    <Button className="w-full mb-2" onClick={() => setIsEditModalOpen(true)}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Profile
                                    </Button>
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href="/profile/settings">
                                            <Settings className="w-4 h-4 mr-2" />
                                            Account Settings
                                        </Link>
                                    </Button>
                                </div>

                                <Separator className="my-6" />

                                {/* Contact Details */}
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Mail className="w-4 h-4" />
                                        <span>{user.email}</span>
                                    </div>
                                    {user.phone_number && (
                                        <div className="flex items-center gap-3 text-muted-foreground">
                                            <Phone className="w-4 h-4" />
                                            <span>{user.phone_number}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Calendar className="w-4 h-4" />
                                        <span>Member since {stats.memberSince}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Edit Profile Modal */}
                        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Edit Profile</DialogTitle>
                                    <DialogDescription>
                                        Update your profile information. Mark sure your contact details are accurate.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleUpdateProfile}>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="name" className="text-right text-sm">
                                                Name
                                            </Label>
                                            <Input
                                                id="name"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                className="col-span-3"
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="phone" className="text-right text-sm">
                                                Phone
                                            </Label>
                                            <Input
                                                id="phone"
                                                value={editForm.phone_number}
                                                onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                                                className="col-span-3"
                                                placeholder="+94 77 123 4567"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={isUpdating}>
                                            {isUpdating ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        {/* Stats Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                    Activity Stats
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <PawPrint className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm">Total Adoptions</span>
                                    </div>
                                    <span className="font-bold text-lg">{stats.totalAdoptions}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Heart className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm">Active Adoptions</span>
                                    </div>
                                    <span className="font-bold text-lg">{stats.activeAdoptions}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Award className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm">Current Streak</span>
                                    </div>
                                    <span className="font-bold text-lg">{stats.currentStreak} days</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm">Total Check-ins</span>
                                    </div>
                                    <span className="font-bold text-lg">{stats.totalCheckIns}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Adoptions */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Current Adoptions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Current Adoptions</CardTitle>
                                <CardDescription>Pets you're currently caring for</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {adoptions.filter((a) => a.status === "active" || a.status === "pending").length > 0 ? (
                                    <div className="space-y-4">
                                        {adoptions
                                            .filter((a) => a.status === "active" || a.status === "pending")
                                            .map((adoption) => (
                                                <div
                                                    key={adoption.id}
                                                    className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl hover:bg-muted/70 transition-colors"
                                                >
                                                    <img
                                                        src={adoption.petImage}
                                                        alt={adoption.petName}
                                                        className="w-16 h-16 rounded-xl object-cover"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <h3 className="font-semibold text-lg">{adoption.petName}</h3>
                                                            {adoption.status === 'pending' && (
                                                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                                    Pending Approval
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {adoption.status === 'pending'
                                                                ? `Application submitted on ${new Date(adoption.adoptionDate).toLocaleDateString()}`
                                                                : `Adopted on ${new Date(adoption.adoptionDate).toLocaleDateString()}`
                                                            }
                                                        </p>
                                                        {adoption.status === 'active' && (
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <Badge variant="outline" className="text-xs">
                                                                    Day {adoption.currentDay}
                                                                </Badge>
                                                                <Badge className="text-xs">
                                                                    <Award className="w-3 h-3 mr-1" />
                                                                    {adoption.currentDay} day streak
                                                                </Badge>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {adoption.status === 'active' && (
                                                        <Button asChild>
                                                            <Link href="/dashboard">View Tracker</Link>
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <PawPrint className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground mb-4">No current adoptions</p>
                                        <Button asChild>
                                            <Link href="/quiz">Find Your Perfect Match</Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Adoption History */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Adoption History</CardTitle>
                                <CardDescription>Your past adoption journey</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-12">
                                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">No completed adoptions yet</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Scheduled Visits */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Scheduled Visits</CardTitle>
                                <CardDescription>Meetings with your potential matches</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoadingVisits ? (
                                    <div className="py-8 text-center text-muted-foreground animate-pulse">Loading visits...</div>
                                ) : visits.length > 0 ? (
                                    <div className="space-y-4">
                                        {visits.map((visit) => (
                                            <div key={visit.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <Calendar className="w-6 h-6 text-primary" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold">Visit for {visit.pet_name}</h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {new Date(visit.visit_date).toLocaleDateString()} at {visit.visit_time.slice(0, 5)}
                                                        </p>
                                                        {visit.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{visit.notes}"</p>}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditingVisit(visit);
                                                            setVisitForm({
                                                                date: visit.visit_date.split('T')[0],
                                                                time: visit.visit_time,
                                                                notes: visit.notes || ""
                                                            });
                                                            setIsEditVisitModalOpen(true);
                                                        }}
                                                    >
                                                        Reschedule
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleCancelVisit(visit.id)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No visits scheduled</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Edit Visit Modal */}
                        <Dialog open={isEditVisitModalOpen} onOpenChange={setIsEditVisitModalOpen}>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Reschedule Visit</DialogTitle>
                                    <DialogDescription>
                                        Change your meeting details for {editingVisit?.pet_name}.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleUpdateVisit}>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="visit_date" className="text-right text-sm">Date</Label>
                                            <Input
                                                id="visit_date"
                                                type="date"
                                                className="col-span-3"
                                                required
                                                value={visitForm.date}
                                                onChange={(e) => setVisitForm({ ...visitForm, date: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="visit_time" className="text-right text-sm">Time</Label>
                                            <Input
                                                id="visit_time"
                                                type="time"
                                                className="col-span-3"
                                                required
                                                value={visitForm.time}
                                                onChange={(e) => setVisitForm({ ...visitForm, time: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="visit_notes" className="text-right text-sm">Notes</Label>
                                            <Input
                                                id="visit_notes"
                                                className="col-span-3"
                                                placeholder="Any questions or notes?"
                                                value={visitForm.notes}
                                                onChange={(e) => setVisitForm({ ...visitForm, notes: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setIsEditVisitModalOpen(false)}>Cancel</Button>
                                        <Button type="submit">Save Changes</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        {/* Achievements */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="w-5 h-5 text-primary" />
                                    Achievements & Badges
                                </CardTitle>
                                <CardDescription>Milestones you've unlocked</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoadingAchievements ? (
                                    <div className="py-8 text-center text-muted-foreground animate-pulse">Loading achievements...</div>
                                ) : achievements.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {achievements.map((achievement) => {
                                            const Icon = {
                                                Award: Award,
                                                TrendingUp: TrendingUp,
                                                Heart: Heart
                                            }[achievement.icon] || Award;

                                            // Dynamic classes based on color
                                            const bgClass = achievement.color === 'primary' ? 'bg-primary/10' :
                                                achievement.color === 'accent' ? 'bg-accent/10' : 'bg-muted/50';
                                            const textClass = achievement.color === 'primary' ? 'text-primary' :
                                                achievement.color === 'accent' ? 'text-accent' : 'text-muted-foreground';

                                            return (
                                                <div key={achievement.type} className={cn("p-4 rounded-xl text-center", bgClass)}>
                                                    <Icon className={cn("w-8 h-8 mx-auto mb-2", textClass)} />
                                                    <p className="font-semibold text-sm">{achievement.title}</p>
                                                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                                                    <p className="text-[10px] text-muted-foreground mt-1">
                                                        {new Date(achievement.achievedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                        <p className="text-muted-foreground">Complete activities to unlock badges!</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Activity Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-primary" />
                                    Activity Timeline
                                </CardTitle>
                                <CardDescription>Your recent interactions and security events</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoadingLogs ? (
                                    <div className="py-8 text-center text-muted-foreground animate-pulse">Loading activity...</div>
                                ) : logs.length > 0 ? (
                                    <div className="space-y-6">
                                        {logs.map((log, index) => (
                                            <div key={log.id} className="relative flex gap-4">
                                                {/* Timeline Line */}
                                                {index !== logs.length - 1 && (
                                                    <div className="absolute left-[11px] top-[24px] w-[2px] h-[calc(100%+24px)] bg-muted" />
                                                )}

                                                {/* Icon Node */}
                                                <div className="relative z-10 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center border-2 border-background">
                                                    <Clock className="w-3 h-3 text-primary" />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 pb-2">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <p className="font-medium text-sm text-foreground">
                                                            {getActivityMessage(log)}
                                                        </p>
                                                        <span className="text-[10px] text-muted-foreground uppercase bg-muted px-1.5 py-0.5 rounded">
                                                            {new Date(log.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground italic text-sm">
                                        No recent activity to show
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
