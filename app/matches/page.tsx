import { Navigation } from "@/components/ui/navigation"
import { Footer } from "@/components/ui/footer"
import { MatchesGrid } from "@/components/matches/matches-grid"

export default function MatchesPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        <MatchesGrid />
      </main>
      <Footer />
    </div>
  )
}
