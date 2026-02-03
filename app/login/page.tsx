import { Navigation } from "@/components/ui/navigation"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        <LoginForm />
      </main>
    </div>
  )
}
