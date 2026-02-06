import { Navigation } from "@/components/ui/navigation"
import { Footer } from "@/components/ui/footer"
import { WelfareDashboard } from "@/components/dashboard/welfare-dashboard"

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        <WelfareDashboard />
      </main>
      <Footer />
    </div>
  )
}
