"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Heart, Shield, Sparkles } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Smart Matching Technology
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
              Find Your
              <span className="text-primary"> Perfect </span>
              Furry Companion
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Stop browsing by looks. Start matching by compatibility. Our data-driven platform ensures lasting bonds
              between pets and families.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-base" asChild>
                <Link href="/quiz">
                  Take Pawsonality Quiz
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base bg-transparent" asChild>
                <Link href="/how-it-works">How It Works</Link>
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Heart className="w-5 h-5 text-primary" />
                <span>
                  <strong className="text-foreground">2,500+</strong> Happy Adoptions
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-5 h-5 text-accent" />
                <span>
                  <strong className="text-foreground">92%</strong> Success Rate
                </span>
              </div>
            </div>
          </div>

          {/* Right content - Hero image */}
          <div className="relative">
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://res.cloudinary.com/dd58qgsfx/image/upload/v1770356669/pawmatch/static/d0e8rgpfa8umymv9jl2n.jpg"
                alt="Happy adopted dog with loving family"
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Floating cards */}
            <div className="absolute -left-4 top-20 bg-card p-4 rounded-2xl shadow-lg border border-border animate-in slide-in-from-left duration-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img src="https://res.cloudinary.com/dd58qgsfx/image/upload/v1770356661/pawmatch/static/i8x0yr1fhvdnsp0ssk4b.jpg" alt="Matched pet" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Max</p>
                  <p className="text-xs text-accent font-medium">95% Match!</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 bottom-20 bg-card p-4 rounded-2xl shadow-lg border border-border animate-in slide-in-from-right duration-700 delay-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Verified Adopter</p>
                  <p className="text-xs text-muted-foreground">Identity confirmed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
