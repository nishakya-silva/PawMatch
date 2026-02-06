import { Card } from "@/components/ui/card"
import { Search, CheckCircle, Home, Heart } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Find Your Match",
    description: "Complete the Pawsonality quiz to get matched with compatible foster dogs",
    step: "01",
  },
  {
    icon: CheckCircle,
    title: "Get Approved",
    description: "Quick verification process and home suitability check",
    step: "02",
  },
  {
    icon: Home,
    title: "14-Day Trial",
    description: "Welcome your foster dog home with full shelter support and supplies",
    step: "03",
  },
  {
    icon: Heart,
    title: "Adopt or Return",
    description: "Decide to adopt permanently or compassionately return with no judgment",
    step: "04",
  },
]

export function FosterProcessSection() {
  return (
    <section className="py-20 bg-accent/30">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How Foster-to-Adopt Works</h2>
          <p className="text-lg text-muted-foreground">Four simple steps to your trial adoption</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card key={index} className="p-6 relative">
              <div className="text-6xl font-bold text-primary/10 absolute top-4 right-4">{step.step}</div>
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <step.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm">{step.description}</p>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Card className="inline-block p-6 bg-primary/5 border-primary/20">
            <p className="text-sm text-muted-foreground mb-2">Success Rate</p>
            <p className="text-4xl font-bold text-primary mb-2">92%</p>
            <p className="text-sm text-muted-foreground">of foster families choose to adopt permanently</p>
          </Card>
        </div>
      </div>
    </section>
  )
}
