import { Navigation } from "@/components/ui/navigation"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen">
            <Navigation />
            <main className="pt-16">
                <ResetPasswordForm />
            </main>
        </div>
    )
}
