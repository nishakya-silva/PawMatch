"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/ui/navigation"
import { Footer } from "@/components/ui/footer"
import { QuizFlow } from "@/components/quiz/quiz-flow"
import { useAuth } from "@/components/providers/auth-provider"

export default function QuizPage() {
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
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        <QuizFlow />
      </main>
      <Footer />
    </div>
  )
}
