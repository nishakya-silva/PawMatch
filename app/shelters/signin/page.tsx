import { Navigation } from "@/components/ui/navigation"
import { ShelterLoginForm } from "@/components/auth/shelter-login-form"
import { Footer } from "@/components/ui/footer"

export default function ShelterLoginPage() {
    return (
        <div className="min-h-screen">
            <Navigation />
            <main className="pt-16">
                <ShelterLoginForm />
            </main>
            <Footer />
        </div>
    )
}
