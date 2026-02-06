import { Brain, CalendarCheck, Dog, ShieldCheck, Users, Zap } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "Compatibility Engine",
    description:
      "Our weighted scoring algorithm matches dogs based on lifestyle, temperament, and household factors - not just breed or size.",
  },
  {
    icon: ShieldCheck,
    title: "Identity Verification",
    description:
      "Prevent fraud and 'dog flipping' with integrated identity verification to ensure legitimate adopters.",
  },
  {
    icon: Dog,
    title: "Buddy-Check System",
    description:
      "Have existing pets? We analyze temperament compatibility between your current companions and potential new family members.",
  },
  {
    icon: CalendarCheck,
    title: "Welfare Tracker",
    description:
      "Automated 14-day monitoring following the 3-3-3 rule with gamified check-ins and shelter alerts for risk patterns.",
  },
  {
    icon: Users,
    title: "Foster-to-Adopt",
    description:
      "Not ready to commit? Try our foster program first - perfect for those hesitant about adopting street dogs.",
  },
  {
    icon: Zap,
    title: "Community Reports",
    description:
      "Spotted an injured or abandoned animal? Report it instantly to registered care centers for faster intervention.",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
            Smarter Adoptions, Happier Endings
          </h2>
          <p className="text-muted-foreground text-lg">
            Every feature designed to ensure the perfect match and support throughout the journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-card p-8 rounded-2xl border border-border hover:border-primary/30 transition-colors group"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
