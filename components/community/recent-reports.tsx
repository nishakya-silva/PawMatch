import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Phone } from "lucide-react"

const recentReports = [
  {
    id: 1,
    animalType: "Dog",
    condition: "injured",
    location: "Colombo 7, near Viharamahadevi Park",
    time: "2 hours ago",
    status: "Responded",
  },
  {
    id: 2,
    animalType: "Cat",
    condition: "abandoned",
    location: "Kandy, Temple Street",
    time: "5 hours ago",
    status: "In Progress",
  },
  {
    id: 3,
    animalType: "Dog",
    condition: "stray",
    location: "Galle Fort area",
    time: "1 day ago",
    status: "Resolved",
  },
]

export function RecentReports() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Recent Reports</h2>
        <p className="text-muted-foreground">Community activity in your area</p>
      </div>

      <div className="space-y-4">
        {recentReports.map((report) => (
          <Card key={report.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{report.animalType}</Badge>
                <Badge
                  variant={
                    report.condition === "injured"
                      ? "destructive"
                      : report.condition === "abandoned"
                        ? "default"
                        : "secondary"
                  }
                >
                  {report.condition}
                </Badge>
              </div>
              <Badge
                variant={
                  report.status === "Resolved" ? "default" : report.status === "Responded" ? "secondary" : "outline"
                }
              >
                {report.status}
              </Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{report.location}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>{report.time}</span>
              </div>
            </div>
          </Card>
        ))}
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
