import { Button } from "@/components/ui/button"
import { Heart, Clock, Shield } from "lucide-react"

export function FosterHeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 md:py-32">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Heart className="w-4 h-4" />
              Not ready to commit? Try fostering first
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">Foster-to-Adopt Program</h1>

            <p className="text-lg text-muted-foreground text-pretty mb-8">
              Perfect for Sri Lankan adopters who want to ensure compatibility before making a permanent commitment.
              Foster a matched dog for 14 days with full shelter support.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Button size="lg" className="text-lg px-8" asChild>
                <a href="#foster-pets">Find Foster Pets</a>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent" asChild>
                <a href="#foster-learn">Learn More</a>
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="flex items-center gap-2 text-primary mb-1">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold">14 Days</div>
                <div className="text-sm text-muted-foreground">Trial Period</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-primary mb-1">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold">92%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-primary mb-1">
                  <Heart className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold">Free</div>
                <div className="text-sm text-muted-foreground">Support</div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <img src="https://res.cloudinary.com/dd58qgsfx/image/upload/v1770356668/pawmatch/static/zhnltumpyqssrmq3ofka.jpg" alt="Foster to adopt" className="w-full h-full object-cover" />
            </div>
            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-xl border border-border max-w-xs">
              <p className="text-sm text-muted-foreground mb-2">What fosters say:</p>
              <p className="font-medium text-balance">
                "The 14-day trial gave us confidence. Now Max is part of our family!"
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
