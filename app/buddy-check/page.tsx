"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/ui/navigation"
import { Footer } from "@/components/ui/footer"
import { BuddyCheckForm } from "@/components/buddy-check/buddy-check-form"
import { BuddyCheckInfo } from "@/components/buddy-check/buddy-check-info"
import { useAuth } from "@/components/providers/auth-provider"

export default function BuddyCheckPage() {
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
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Existing Pet Buddy-Check</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ensure your current pets will be compatible with your potential new family member
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <BuddyCheckForm />
          <BuddyCheckInfo />
        </div>
      </main>
      <Footer />
    </div>
  )
}
