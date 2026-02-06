import { Navigation } from "@/components/ui/navigation"
import { ShelterRegisterForm } from "@/components/auth/shelter-register-form"
import { Footer } from "@/components/ui/footer"

export default function ShelterRegisterPage() {
    return (
        <div className="min-h-screen">
            <Navigation />
            <main className="pt-16">
                <ShelterRegisterForm />
            </main>
            <Footer />
        </div>
    )
}
