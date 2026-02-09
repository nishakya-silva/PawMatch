"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Check, Dog, Home, Clock, Users, Zap, Heart, TreeDeciduous, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/providers/auth-provider"

const quizQuestions = [
  {
    id: 1,
    category: "Living Situation",
    icon: Home,
    question: "What best describes your living situation?",
    options: [
      { value: "apartment", label: "Apartment/Flat", description: "Limited outdoor space" },
      { value: "house_small", label: "House with small yard", description: "Some outdoor space" },
      { value: "house_large", label: "House with large yard", description: "Plenty of outdoor space" },
      { value: "rural", label: "Rural property", description: "Lots of open land" },
    ],
  },
  {
    id: 2,
    category: "Activity Level",
    icon: Zap,
    question: "How would you describe your activity level?",
    options: [
      { value: "sedentary", label: "Relaxed", description: "I prefer quiet activities at home" },
      { value: "moderate", label: "Moderately Active", description: "Regular walks and occasional adventures" },
      { value: "active", label: "Very Active", description: "Daily exercise, hiking, running" },
      { value: "athletic", label: "Athletic", description: "Intense daily workouts, outdoor sports" },
    ],
  },
  {
    id: 3,
    category: "Time Availability",
    icon: Clock,
    question: "How much time can you dedicate to a pet daily?",
    options: [
      { value: "limited", label: "1-2 hours", description: "Busy schedule, limited time" },
      { value: "moderate", label: "3-4 hours", description: "Work from home some days" },
      { value: "flexible", label: "5-6 hours", description: "Flexible schedule" },
      { value: "full", label: "6+ hours", description: "Home most of the day" },
    ],
  },
  {
    id: 4,
    category: "Household",
    icon: Users,
    question: "Who lives in your household?",
    options: [
      { value: "single", label: "Just me", description: "Living alone" },
      { value: "couple", label: "Partner/Spouse", description: "Two adults" },
      { value: "family_older", label: "Family with older kids", description: "Children 10+" },
      { value: "family_young", label: "Family with young kids", description: "Children under 10" },
    ],
  },
  {
    id: 5,
    category: "Experience",
    icon: Dog,
    question: "What's your experience with dogs?",
    options: [
      { value: "first", label: "First-time owner", description: "Never owned a dog before" },
      { value: "some", label: "Some experience", description: "Had dogs growing up" },
      { value: "experienced", label: "Experienced owner", description: "Owned multiple dogs" },
      { value: "expert", label: "Professional experience", description: "Trainer or worked with dogs" },
    ],
  },
  {
    id: 6,
    category: "Existing Pets",
    icon: Heart,
    question: "Do you have other pets at home?",
    options: [
      { value: "none", label: "No other pets", description: "This would be my only pet" },
      { value: "dog", label: "Another dog", description: "I have one or more dogs" },
      { value: "cat", label: "Cat(s)", description: "I have one or more cats" },
      { value: "other", label: "Other pets", description: "Birds, small animals, etc." },
    ],
  },
  {
    id: 7,
    category: "Environment",
    icon: TreeDeciduous,
    question: "What's your neighborhood like?",
    options: [
      { value: "urban", label: "Urban/City center", description: "Busy streets, limited green spaces" },
      { value: "suburban", label: "Suburban", description: "Parks nearby, moderate traffic" },
      { value: "semi_rural", label: "Semi-rural", description: "Quiet area, nature accessible" },
      { value: "rural", label: "Rural/Countryside", description: "Wide open spaces, very quiet" },
    ],
  },
]

const extraPetQuestions = [
  {
    id: 101, // Custom ID to avoid overlap
    category: "Current Pet Personality",
    icon: Heart,
    question: "How would you describe your current pet's dominance level?",
    options: [
      { value: "submissive", label: "Submissive", description: "Follows and yields easily" },
      { value: "neutral", label: "Neutral", description: "Easy-going and adaptable" },
      { value: "dominant", label: "Dominant", description: "Likes to be the leader" },
    ],
  },
  {
    id: 102,
    category: "Current Pet Sociality",
    icon: Users,
    question: "How friendly is your current pet with new animals?",
    options: [
      { value: "very_friendly", label: "Very Friendly", description: "Loves making new friends" },
      { value: "selective", label: "Selective", description: "Likes some, dislikes others" },
      { value: "nervous", label: "Nervous/Fearful", description: "Needs slow introductions" },
    ],
  },
]

export function QuizFlow() {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isComplete, setIsComplete] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Dynamically build the question list based on answers
  const getActiveQuestions = () => {
    let questions = [...quizQuestions]

    // If they have existing pets (Question ID 6), add the extra questions
    const hasExistingPet = answers[6] && answers[6] !== 'none'

    if (hasExistingPet) {
      // Insert extra questions after the "Existing Pets" question (which has ID 6)
      // We'll just append them or interject them. Let's append before the last "Environment" question for better flow
      const envIndex = questions.findIndex(q => q.id === 7)
      questions.splice(envIndex, 0, ...extraPetQuestions)
    }

    return questions
  }

  const activeQuestions = getActiveQuestions()
  const progress = ((currentStep + 1) / activeQuestions.length) * 100
  const currentQuestion = activeQuestions[currentStep]

  const handleSelect = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: value })
  }

  const submitQuiz = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('http://localhost:5000/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, userId: user?.id })
      })
      const data = await response.json()

      if (data.success) {
        localStorage.setItem('pawmatch_matches', JSON.stringify(data.matches))
        localStorage.setItem('pawmatch_quiz_timestamp', Date.now().toString())
        localStorage.setItem('pawmatch_quiz_user_id', user ? user.id.toString() : '');
        setIsComplete(true)
      } else {
        setIsComplete(true)
      }
    } catch (error) {
      setIsComplete(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = () => {
    if (currentStep < activeQuestions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      submitQuiz()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (isComplete) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Quiz Complete!</h1>
          <p className="text-muted-foreground mb-8">
            We've analyzed your responses and found your perfect matches.
          </p>
          <Button size="lg" asChild>
            <a href="/matches">
              View Your Matches
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>
              Question {currentStep + 1} of {activeQuestions.length}
            </span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <currentQuestion.icon className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm font-medium text-primary">{currentQuestion.category}</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-8">{currentQuestion.question}</h2>

          <div className="grid gap-4">
            {currentQuestion.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border-2 transition-all",
                  answers[currentQuestion.id] === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30",
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  {answers[currentQuestion.id] === option.value && (
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button variant="ghost" onClick={handleBack} disabled={currentStep === 0 || isSubmitting}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleNext} disabled={!answers[currentQuestion.id] || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  {currentStep === activeQuestions.length - 1 ? "Complete Quiz" : "Next"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
