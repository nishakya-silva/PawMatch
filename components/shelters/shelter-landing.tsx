import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, BarChart3, Bell, CheckCircle, Clock, Shield, Users, Zap } from "lucide-react"
import Link from "next/link"

const benefits = [
  {
    icon: BarChart3,
    title: "Reduce Return Rates",
    description: "Our compatibility matching significantly decreases adoption failures and returns.",
  },
  {
    icon: Clock,
    title: "Save Staff Time",
    description: "Automated follow-ups and welfare tracking reduce manual administrative work.",
  },
  {
    icon: Bell,
    title: "Early Warning Alerts",
    description: "Get notified when adopters show risk patterns during the adjustment period.",
  },
  {
    icon: Shield,
    title: "Verified Adopters",
    description: "Identity verification prevents fraud and ensures legitimate adoption applications.",
  },
  {
    icon: Users,
    title: "Better Matches",
    description: "Data-driven compatibility ensures pets go to homes where they'll thrive.",
  },
  {
    icon: Zap,
    title: "Easy Integration",
    description: "Simple onboarding process with dedicated support for your shelter.",
  },
]

const stats = [
  { value: "92%", label: "Adoption success rate" },
  { value: "75%", label: "Reduction in returns" },
  { value: "60%", label: "Time saved on follow-ups" },
]

export function ShelterLanding() {
  return (
    <div>
      {/* Hero */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="outline" className="border-primary/30 text-primary">
                For Animal Shelters
              </Badge>
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight text-balance">
                Smarter Adoptions,
                <span className="text-primary"> Less Returns</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                Partner with PawMatch to improve adoption outcomes, reduce administrative burden, and ensure every
                animal finds a compatible forever home.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/shelters/register">
                    Become a Partner
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/shelters/demo">Request Demo</Link>
                </Button>
              </div>
              <div className="pt-2">
                <Link href="/shelters/signin" className="text-sm text-primary hover:underline font-medium">
                  Already a partner? Sign in to your dashboard
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="/placeholder.svg?height=500&width=600"
                alt="Partner shelter"
                className="rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <p className="text-primary-foreground/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">
              A simple, streamlined process to help you manage adoptions effectively.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 z-10">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Become a Partner</h3>
              <p className="text-muted-foreground">Create your shelter profile.</p>
            </div>
            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 z-10">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">List</h3>
              <p className="text-muted-foreground">Upload dog profiles (or sync with existing databases).</p>
            </div>
            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 z-10">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Match</h3>
              <p className="text-muted-foreground">Let the algorithm filter high-compatibility applicants.</p>
            </div>
            {/* Step 4 */}
            <div className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 z-10">
                <span className="text-2xl font-bold text-primary">4</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Monitor</h3>
              <p className="text-muted-foreground">Receive automated welfare reports during the settling-in phase.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4 text-balance">Why Shelters Choose PawMatch</h2>
            <p className="text-muted-foreground text-lg">
              Tools designed specifically to support your mission of finding loving homes for animals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="p-6 bg-card border border-border rounded-2xl hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard preview */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6 text-balance">
                Powerful Dashboard for Shelter Management
              </h2>
              <div className="space-y-4">
                {[
                  "Track all active adoptions in real-time",
                  "View welfare tracker alerts and risk patterns",
                  "Manage pet profiles and compatibility scores",
                  "Access adopter verification status",
                  "Generate reports on adoption outcomes",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
              <Button className="mt-8" asChild>
                <Link href="/shelters/register">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-border">
              <img
                src="/placeholder.svg?height=500&width=700"
                alt="Shelter dashboard preview"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4 text-balance">
            Ready to Transform Your Adoption Process?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join 50+ shelters across Sri Lanka already using PawMatch to create better outcomes for animals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/shelters/register">
                Become a Partner
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
