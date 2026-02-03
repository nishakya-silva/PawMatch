import { Navigation } from "@/components/ui/navigation"
import { VerifyForm } from "@/components/auth/verify-form"

export default function VerifyPage() {
    return (
        <div className="min-h-screen">
            <Navigation />
            <main className="pt-16">
                <VerifyForm />
            </main>
        </div>
    )
}
