import { Suspense } from "react"
import { Navigation } from "@/components/ui/navigation"
import { Footer } from "@/components/ui/footer"
import { MatchesGrid } from "@/components/matches/matches-grid"

export default function MatchesPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Loading matches...</div>}>
          <MatchesGrid />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
