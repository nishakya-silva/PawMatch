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
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Adoption {
    id: number
    petId: number
    petName: string
    petImage: string
    adoptionDate: string
    currentDay: number
    status: "active" | "completed"
}

interface UserStats {
    totalAdoptions: number
    activeAdoptions: number
    totalCheckIns: number
    currentStreak: number
    longestStreak: number
    memberSince: string
}

export function ProfilePage() {
    const { user, isLoading } = useAuth()
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

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login")
            return
        }

        if (user) {
            fetchUserData()
        }
    }, [user, isLoading, router])

    const fetchUserData = async () => {
        try {
            // For now, using mock data since backend has port issues
            // TODO: Replace with actual API calls when backend is running
            // const adoptionsRes = await fetch(`http://localhost:5000/api/users/${user.id}/adoptions`)
            // const statsRes = await fetch(`http://localhost:5000/api/users/${user.id}/stats`)

            // Mock data for demonstration
            setAdoptions([
                {
                    id: 1,
                    petId: 1,
                    petName: "Max",
                    petImage: "/placeholder.svg",
                    adoptionDate: "2026-01-25",
                    currentDay: 11,
                    status: "active",
                },
            ])

            setStats({
                totalAdoptions: 1,
                activeAdoptions: 1,
                totalCheckIns: 45,
                currentStreak: 11,
                longestStreak: 11,
                memberSince: "January 2026",
            })
        } catch (error) {
            console.error("Failed to fetch user data:", error)
        } finally {
            setLoading(false)
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

                                    <Button className="w-full mb-2">
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Profile
                                    </Button>
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href="/dashboard">
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
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Calendar className="w-4 h-4" />
                                        <span>Member since {stats.memberSince}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

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
                                {adoptions.filter((a) => a.status === "active").length > 0 ? (
                                    <div className="space-y-4">
                                        {adoptions
                                            .filter((a) => a.status === "active")
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
                                                        <h3 className="font-semibold text-lg">{adoption.petName}</h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            Adopted on {new Date(adoption.adoptionDate).toLocaleDateString()}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <Badge variant="outline" className="text-xs">
                                                                Day {adoption.currentDay}
                                                            </Badge>
                                                            <Badge className="text-xs">
                                                                <Award className="w-3 h-3 mr-1" />
                                                                {adoption.currentDay} day streak
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <Button asChild>
                                                        <Link href="/dashboard">View Tracker</Link>
                                                    </Button>
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
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-primary/10 rounded-xl text-center">
                                        <Award className="w-8 h-8 text-primary mx-auto mb-2" />
                                        <p className="font-semibold text-sm">First Adoption</p>
                                        <p className="text-xs text-muted-foreground">Welcomed your first pet</p>
                                    </div>
                                    <div className="p-4 bg-accent/10 rounded-xl text-center">
                                        <TrendingUp className="w-8 h-8 text-accent mx-auto mb-2" />
                                        <p className="font-semibold text-sm">10 Day Streak</p>
                                        <p className="text-xs text-muted-foreground">Consistent care tracking</p>
                                    </div>
                                    <div className="p-4 bg-muted/50 rounded-xl text-center opacity-50">
                                        <Heart className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                        <p className="font-semibold text-sm">Bonding Master</p>
                                        <p className="text-xs text-muted-foreground">Complete 90 day journey</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
