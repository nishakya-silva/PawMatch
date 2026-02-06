import { Card } from "@/components/ui/card"
import { Shield, Heart, Users, Home, Phone, Gift } from "lucide-react"

const benefits = [
  {
    icon: Shield,
    title: "Risk-Free Trial",
    description: "Test compatibility for 14 days before making a permanent commitment",
  },
  {
    icon: Heart,
    title: "Full Shelter Support",
    description: "Access to veterinary care, food supplies, and behavioral guidance",
  },
  {
    icon: Users,
    title: "Community Network",
    description: "Connect with experienced foster families and get advice",
  },
  {
    icon: Home,
    title: "In-Home Assessment",
    description: "See how the dog adapts to your actual living environment",
  },
  {
    icon: Phone,
    title: "24/7 Helpline",
    description: "Immediate support if you encounter any challenges",
  },
  {
    icon: Gift,
    title: "Starter Kit Included",
    description: "Receive food, toys, and essentials for the trial period",
  },
]

export function FosterBenefitsSection() {
  return (
    <section id="foster-learn" className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Foster-to-Adopt?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Designed specifically for the Sri Lankan context where adopters may hesitate to immediately commit to street
            dogs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <benefit.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
