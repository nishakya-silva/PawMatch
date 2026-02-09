import { Navigation } from "@/components/ui/navigation"
import { Footer } from "@/components/ui/footer"
import { ShelterLanding } from "@/components/shelters/shelter-landing"

export default function SheltersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <ShelterLanding />
      </main>
      <Footer />
    </div>
  )
}
