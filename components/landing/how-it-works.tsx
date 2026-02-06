import { ArrowRight } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Take the Pawsonality Quiz",
    description:
      "Answer questions about your lifestyle, living situation, activity level, and what you're looking for in a pet.",
    image: "https://res.cloudinary.com/dd58qgsfx/image/upload/v1770356673/pawmatch/static/dht7gdu7u0n0dektyby8.jpg",
  },
  {
    number: "02",
    title: "Get Your Matches",
    description: "Our algorithm analyzes your profile against available pets and ranks them by compatibility score.",
    image: "https://res.cloudinary.com/dd58qgsfx/image/upload/v1770356672/pawmatch/static/ojmrxvsu7lkphwmpodyn.jpg",
  },
  {
    number: "03",
    title: "Meet & Verify",
    description: "Visit the shelter, meet your matches, and complete our quick identity verification process.",
    image: "https://res.cloudinary.com/dd58qgsfx/image/upload/v1770356663/pawmatch/static/kjtyqjsnsoolxcvmjiep.jpg",
  },
  {
    number: "04",
    title: "Supported Transition",
    description: "Use our welfare tracker during the first 14 days to ensure a smooth adjustment for everyone.",
    image: "https://res.cloudinary.com/dd58qgsfx/image/upload/v1770356667/pawmatch/static/cskdghxrjqubehgdhseh.jpg",
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
            Your Journey to a Perfect Match
          </h2>
          <p className="text-muted-foreground text-lg">Four simple steps to find your forever friend</p>
        </div>

        <div className="space-y-16">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`flex flex-col ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-12 items-center`}
            >
              <div className="flex-1 space-y-4">
                <span className="text-6xl font-bold text-primary/20">{step.number}</span>
                <h3 className="text-2xl font-bold text-foreground">{step.title}</h3>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-md">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex items-center gap-2 text-primary pt-4">
                    <ArrowRight className="w-5 h-5" />
                    <span className="text-sm font-medium">Next step</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="rounded-2xl overflow-hidden shadow-xl">
                  <img src={step.image || "/placeholder.svg"} alt={step.title} className="w-full h-auto object-cover" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
