import { Navigation } from "@/components/ui/navigation"
import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
    return (
        <div className="min-h-screen">
            <Navigation />
            <main className="pt-16">
                <RegisterForm />
            </main>
        </div>
    )
}
