import { Navigation } from "@/components/ui/navigation"
import { Footer } from "@/components/ui/footer"
import { PetProfile } from "@/components/pet/pet-profile"

export default function PetPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        <PetProfile />
      </main>
      <Footer />
    </div>
  )
}
