"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Calendar,
  Check,
  AlertTriangle,
  Heart,
  Utensils,
  Moon,
  Smile,
  Activity,
  Award,
  TrendingUp,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

const defaultChecklist = [
  { id: 1, task: "Morning feeding", completed: false, icon: Utensils },
  { id: 2, task: "Afternoon walk", completed: false, icon: Activity },
  { id: 3, task: "Evening feeding", completed: false, icon: Utensils },
  { id: 4, task: "Log mood/behavior", completed: false, icon: Smile },
  { id: 5, task: "Bedtime routine", completed: false, icon: Moon },
]

const moodColors: Record<string, string> = {
  anxious: "bg-destructive/20 text-destructive",
  cautious: "bg-warning/20 text-warning-foreground",
  curious: "bg-primary/20 text-primary",
  playful: "bg-accent/20 text-accent",
  happy: "bg-accent/20 text-accent",
  content: "bg-accent/20 text-accent",
}

export function WelfareDashboard() {
  const [checklist, setChecklist] = useState(defaultChecklist)
  const [loading, setLoading] = useState(true)
  const [adoptionData, setAdoptionData] = useState<any>({
    petName: "Loading...",
    petImage: "/placeholder.svg",
    adoptionDate: "-",
    currentDay: 1,
    totalDays: 14,
    overallProgress: 0,
    streak: 0,
  })
  const [phaseInfo, setPhaseInfo] = useState({
    current: 1,
    phases: [
      { day: 3, name: "Decompression", description: "Pet is getting used to new environment", status: "active" },
      { day: 21, name: "Learning", description: "Pet is learning routines and rules", status: "upcoming" },
      { day: 90, name: "Bonding", description: "True personality emerges, deep bonding begins", status: "upcoming" },
    ]
  })
  const [moodLog, setMoodLog] = useState<any[]>([])

  useEffect(() => {
    // Fetch Dashboard Data
    const fetchDashboard = async () => {
      try {
        // Hardcoded adoptionId for demo
        const res = await fetch('http://localhost:5001/api/welfare/1')
        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()

        setAdoptionData({
          petName: data.petName,
          petImage: data.petImage || "/placeholder.svg",
          adoptionDate: new Date(data.adoptionDate).toLocaleDateString(),
          currentDay: data.currentDay,
          totalDays: 14,
          overallProgress: data.overallProgress,
          streak: data.streak
        })

        if (data.logs) {
          // Parse logs if needed to populate moodLog
          // For now using empty or mapped logs
          setMoodLog(data.logs.map((l: any) => ({
            day: new Date(l.log_date).getDate(), // simplified
            mood: l.mood,
            notes: l.notes
          })))
        }

        // Update phases based on current day
        const day = data.currentDay
        setPhaseInfo(prev => ({
          ...prev,
          phases: prev.phases.map(p => ({
            ...p,
            status: day > p.day ? "complete" : (day >= (p.day === 3 ? 1 : (p.day === 21 ? 4 : 22)) && day <= p.day) ? "active" : "upcoming"
          }))
        }))

      } catch (err) {
        console.error("Dashboard load error", err)
        // Keep defaults
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  const toggleTask = (id: number) => {
    setChecklist((prev) => prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const completedTasks = checklist.filter((t) => t.completed).length
  const taskProgress = (completedTasks / checklist.length) * 100

  if (loading) return <div className="p-8 text-center">Loading Welfare Tracker...</div>

  return (
    <div className="py-8 bg-muted/30 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <img
              src={adoptionData.petImage || "/placeholder.svg"}
              alt={adoptionData.petName}
              className="w-16 h-16 rounded-2xl object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-foreground">{adoptionData.petName}'s Welfare Tracker</h1>
              <p className="text-muted-foreground">
                Day {adoptionData.currentDay} of {adoptionData.totalDays} • Adopted {adoptionData.adoptionDate}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1 py-1.5">
              <Award className="w-4 h-4 text-primary" />
              {adoptionData.streak} day streak
            </Badge>
            <Button variant="outline">Contact Shelter</Button>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* 3-3-3 Rule Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  3-3-3 Rule Progress
                </CardTitle>
                <CardDescription>
                  The first 3 days, 3 weeks, and 3 months are critical adjustment periods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Timeline */}
                  <div className="relative">
                    <Progress value={adoptionData.overallProgress} className="h-3" />
                    <div className="flex justify-between mt-2 text-sm">
                      <span className="text-muted-foreground">Day 1</span>
                      <span className="font-medium text-primary">Day {adoptionData.currentDay}</span>
                      <span className="text-muted-foreground">Day 14</span>
                    </div>
                  </div>

                  {/* Phases */}
                  <div className="grid md:grid-cols-3 gap-4">
                    {phaseInfo.phases.map((phase, index) => (
                      <div
                        key={index}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all",
                          phase.status === "complete"
                            ? "border-accent bg-accent/5"
                            : phase.status === "active"
                              ? "border-primary bg-primary/5"
                              : "border-border bg-card",
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Day 1-{phase.day}</span>
                          {phase.status === "complete" && <Check className="w-4 h-4 text-accent" />}
                          {phase.status === "active" && <Badge className="text-xs">Current</Badge>}
                        </div>
                        <h4 className="font-semibold text-foreground mb-1">{phase.name}</h4>
                        <p className="text-sm text-muted-foreground">{phase.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mood tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smile className="w-5 h-5 text-primary" />
                  Mood Progress
                </CardTitle>
                <CardDescription>Track {adoptionData.petName}'s emotional journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {moodLog.map((entry) => (
                    <div key={entry.day} className="flex items-center gap-4 p-3 bg-muted/50 rounded-xl">
                      <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center font-semibold text-sm">
                        {entry.day}
                      </div>
                      <Badge className={cn("capitalize", moodColors[entry.mood])}>{entry.mood}</Badge>
                      <p className="text-sm text-muted-foreground flex-1">{entry.notes}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Daily checklist */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Today's Checklist
                </CardTitle>
                <CardDescription>
                  {completedTasks} of {checklist.length} tasks completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={taskProgress} className="h-2 mb-4" />
                <div className="space-y-3">
                  {checklist.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                        task.completed
                          ? "bg-accent/10 border-accent/30"
                          : "bg-card border-border hover:border-primary/30",
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          task.completed ? "bg-accent text-accent-foreground" : "bg-muted",
                        )}
                      >
                        {task.completed ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <task.icon className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "font-medium",
                          task.completed ? "text-muted-foreground line-through" : "text-foreground",
                        )}
                      >
                        {task.task}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Day {adoptionData.currentDay} Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-accent/10 rounded-xl">
                  <h4 className="font-medium text-foreground mb-2">Keep routines consistent</h4>
                  <p className="text-sm text-muted-foreground">
                    Dogs thrive on predictability. Feed, walk, and play at the same times daily.
                  </p>
                </div>
                <div className="p-4 bg-primary/10 rounded-xl">
                  <h4 className="font-medium text-foreground mb-2">Watch for signs of stress</h4>
                  <p className="text-sm text-muted-foreground">
                    Excessive panting, hiding, or loss of appetite may indicate adjustment struggles.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Alert card */}
            <Card className="border-warning/50 bg-warning/5">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Shelter Check-in Due</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Your shelter will reach out tomorrow for a routine check-in.
                    </p>
                    <Button size="sm" variant="outline">
                      Prepare Notes
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
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
