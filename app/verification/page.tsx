"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/ui/navigation"
import { Footer } from "@/components/ui/footer"
import { VerificationForm } from "@/components/verification/verification-form"
import { VerificationInfo } from "@/components/verification/verification-info"
import { useAuth } from "@/components/providers/auth-provider"

export default function VerificationPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-12 max-w-7xl pt-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Identity Verification</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Help us prevent fraud and ensure safe adoptions for all animals
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <VerificationForm />
          <VerificationInfo />
        </div>
      </main>
      <Footer />
    </div>
  )
}
