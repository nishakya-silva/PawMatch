"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/ui/navigation"
import { ShelterLoginForm } from "@/components/auth/shelter-login-form"
import { Footer } from "@/components/ui/footer"
import { useAuth } from "@/components/providers/auth-provider"

export default function ShelterLoginPage() {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && user) {
            if (user.role === 'shelter') {
                router.replace('/shelters/dashboard')
            } else if (user.role === 'admin') {
                router.replace('/admin/dashboard')
            } else {
                router.replace('/dashboard')
            }
        }
    }, [user, isLoading, router])

    if (!isLoading && user) {
        return <div className="min-h-screen bg-background" />
    }

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
