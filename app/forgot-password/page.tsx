import { Navigation } from "@/components/ui/navigation"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen">
            <Navigation />
            <main className="pt-16">
                <ForgotPasswordForm />
            </main>
        </div>
    )
}
