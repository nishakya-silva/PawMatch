"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/ui/navigation"
import { Footer } from "@/components/ui/footer"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { HowItWorksSection } from "@/components/landing/how-it-works"
import { CommunityFeaturesSection } from "@/components/landing/community-features"
import { StatsSection } from "@/components/landing/stats-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { CTASection } from "@/components/landing/cta-section"
import { useAuth } from "@/components/providers/auth-provider"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'admin') {
        router.replace('/admin/dashboard')
      } else if (user.role === 'shelter') {
        router.replace('/shelters/dashboard')
      }
    }
  }, [user, isLoading, router])

  // Optional: Return null or a loader if redirecting to prevent flash
  // For now, we render the home page while checking, to support SEO bots (who won't have user auth)
  // and to provide a fallback. If the flash is annoying, we can return null if user.role is shelter/admin.

  if (user?.role === 'shelter' || user?.role === 'admin') {
    return <div className="min-h-screen bg-background" /> // Empty screen while redirecting
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CommunityFeaturesSection />
        <StatsSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
