"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/ui/navigation"
import { Footer } from "@/components/ui/footer"
import { WelfareDashboard } from "@/components/dashboard/welfare-dashboard"
import { useAuth } from "@/components/providers/auth-provider"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    } else if (!isLoading && user) {
      if (user.role === 'admin') {
        router.replace('/admin/dashboard')
      } else if (user.role === 'shelter') {
        router.replace('/shelters/dashboard')
      }
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        <WelfareDashboard />
      </main>
      <Footer />
    </div>
  )
}
