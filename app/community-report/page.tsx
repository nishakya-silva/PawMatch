import { CommunityReportForm } from "@/components/community/report-form"
import { RecentReports } from "@/components/community/recent-reports"
import { Navigation } from "@/components/ui/navigation"
import { Footer } from "@/components/ui/footer"

export default function CommunityReportPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Report an Animal in Need</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Help us protect animals in your community. Report injured, abandoned, or at-risk animals for immediate
            intervention.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <CommunityReportForm />
          <RecentReports />
        </div>
      </main>
      <Footer />
    </div>
  )
}
