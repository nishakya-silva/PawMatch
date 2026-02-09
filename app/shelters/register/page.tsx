"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/ui/navigation"
import { ShelterRegisterForm } from "@/components/auth/shelter-register-form"
import { Footer } from "@/components/ui/footer"
import { useAuth } from "@/components/providers/auth-provider"

export default function ShelterRegisterPage() {
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
                <ShelterRegisterForm />
            </main>
            <Footer />
        </div>
    )
}
