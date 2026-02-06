import { Navigation } from "@/components/ui/navigation"
import { Footer } from "@/components/ui/footer"
import { QuizFlow } from "@/components/quiz/quiz-flow"

export default function QuizPage() {
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
