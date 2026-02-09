import { Navigation } from "@/components/ui/navigation"
import { Footer } from "@/components/ui/footer"
import { FosterHeroSection } from "@/components/foster/hero-section"
import { FosterBenefitsSection } from "@/components/foster/benefits-section"
import { FosterProcessSection } from "@/components/foster/process-section"
import { FosterPetsSection } from "@/components/foster/pets-section"

export default function FosterToAdoptPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <FosterHeroSection />
        <FosterBenefitsSection />
        <FosterProcessSection />
        <FosterPetsSection />
      </main>
      <Footer />
    </div>
  )
}
