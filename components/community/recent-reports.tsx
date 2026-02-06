"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Phone, Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"

export function RecentReports() {
  const [reports, setReports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [myReports, setMyReports] = useState<number[]>([])

  const fetchReports = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/reports')
      const data = await res.json()
      if (data.success) {
        setReports(data.reports)
      }
    } catch (err) {
      console.error("Error fetching reports:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()

    // Load my report IDs
    const stored = JSON.parse(localStorage.getItem('pawmatch_my_reports') || '[]')
    setMyReports(stored)

    // Poll for new reports every 30 seconds
    const interval = setInterval(fetchReports, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleCancel = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this report?")) return

    try {
      const res = await fetch(`http://localhost:5000/api/reports/${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Report cancelled successfully")

        // Remove from local storage list
        const updatedMyReports = myReports.filter(rid => rid !== id)
        setMyReports(updatedMyReports)
        localStorage.setItem('pawmatch_my_reports', JSON.stringify(updatedMyReports))

        fetchReports()
      } else {
        toast.error(data.error || "Failed to cancel report")
      }
    } catch (err) {
      toast.error("An error occurred")
    }
  }

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return "Just now"
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Recent Reports</h2>
        <p className="text-muted-foreground">Community activity in your area</p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : reports.length > 0 ? (
          reports.map((report) => (
            <Card key={report.id} className="p-4 hover:shadow-md transition-shadow relative">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{report.animal_type}</Badge>
                  <Badge
                    variant={
                      report.condition_type === "injured"
                        ? "destructive"
                        : report.condition_type === "abandoned"
                          ? "default"
                          : "secondary"
                    }
                  >
                    {report.condition_type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      report.status === "resolved" ? "default" : report.status === "responded" ? "secondary" : "outline"
                    }
                    className="capitalize"
                  >
                    {report.status}
                  </Badge>

                  {myReports.includes(report.id) && report.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(report.id)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      title="Cancel report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{report.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>{formatRelativeTime(report.created_at)}</span>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <p className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">No recent reports found.</p>
        )}
      </div>

      <Card className="p-6 bg-accent/50 border-accent">
        <h3 className="font-semibold mb-2">Emergency Hotline</h3>
        <p className="text-sm text-muted-foreground mb-3">For life-threatening emergencies, call immediately</p>
        <a href="tel:+94112345678" className="inline-flex items-center gap-2 text-primary font-semibold">
          <Phone className="w-4 h-4" />
          +94 11 234 5678
        </a>
      </Card>
    </div>
  )
}
