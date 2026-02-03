import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle, Heart } from "lucide-react"

export function CommunityFeaturesSection() {
  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Community Care Features</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Beyond adoption, we help protect and care for all animals in our community
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-8 border-2 hover:border-primary transition-colors">
            <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center mb-6">
              <AlertCircle className="w-7 h-7 text-accent-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Report Injured or Abandoned Animals</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Found a stray or injured animal? Report it directly to nearby shelters and rescue organizations. Include
              photos, location, and condition details to help save lives.
            </p>
            <Button asChild size="lg">
              <Link href="/community-report">Report an Animal</Link>
            </Button>
          </Card>

          <Card className="p-8 border-2 hover:border-primary transition-colors">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-6">
              <Heart className="w-7 h-7 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Foster-to-Adopt Program</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Not ready to commit? Try fostering first. Take a pet home for a trial period before making the final
              adoption decision. Perfect for first-time pet parents.
            </p>
            <Button asChild size="lg" variant="outline">
              <Link href="/foster-to-adopt">Learn About Fostering</Link>
            </Button>
          </Card>
        </div>
      </div>
    </section>
  )
}
