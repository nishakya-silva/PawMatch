import { Navigation } from "@/components/ui/navigation"
import { Footer } from "@/components/ui/footer"
import { PetProfile } from "@/components/pet/pet-profile"

export default async function PetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        <PetProfile id={id} />
      </main>
      <Footer />
    </div>
  )
}
