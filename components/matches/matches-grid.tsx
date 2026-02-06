"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin, Calendar, SlidersHorizontal, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function MatchesGrid() {
  const [favorites, setFavorites] = useState<number[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [matches, setMatches] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        // 1. Check if we have quiz results in localStorage
        const storedMatches = localStorage.getItem('pawmatch_matches')
        if (storedMatches) {
          const parsedMatches = JSON.parse(storedMatches)
          if (parsedMatches && parsedMatches.length > 0) {
            // Map the stored matches to the UI format
            const mappedMatches = parsedMatches.map((m: any) => ({
              id: m.id,
              name: m.name,
              breed: m.breed,
              age: m.age,
              gender: m.gender,
              location: "PawMatch Shelter",
              compatibility: m.matchScore || 0,
              reasons: m.matchReasons || [],
              is_foster: m.is_foster || false,
              traits: typeof m.temperament === 'string' ? JSON.parse(m.temperament) : (m.temperament || []),
              image: m.profile_image_url || m.image_url || "/placeholder.svg?height=400&width=400"
            }))
            setMatches(mappedMatches)
            setIsLoading(false)
            return // Skip fetching general list
          }
        }

        // 2. Fallback: Fetch all available pets if no quiz results
        const res = await fetch('http://localhost:5000/api/pets?status=available')
        const data = await res.json()
        if (data.success) {
          const apiMatches = data.pets.map((m: any) => ({
            id: m.id,
            name: m.name,
            breed: m.breed,
            age: m.age,
            gender: m.gender,
            location: "PawMatch Shelter",
            compatibility: 0, // No quiz done
            reasons: [],
            is_foster: m.is_foster || false,
            traits: typeof m.temperament === 'string' ? JSON.parse(m.temperament) : (m.temperament || []),
            image: m.profile_image_url || m.image_url || "/placeholder.svg?height=400&width=400"
          }))
          setMatches(apiMatches)
        }
      } catch (e) {
        console.error("Failed to fetch matches", e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchMatches()
  }, [])

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Your Matches</h1>
            <p className="text-muted-foreground">
              Based on your Pawsonality Quiz results, here are your compatible matches
            </p>
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="bg-card border border-border rounded-xl p-6 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Age</label>
                <select className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                  <option>Any age</option>
                  <option>Puppy ({"<"}1 year)</option>
                  <option>Young (1-3 years)</option>
                  <option>Adult (3-7 years)</option>
                  <option>Senior (7+ years)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Size</label>
                <select className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                  <option>Any size</option>
                  <option>Small</option>
                  <option>Medium</option>
                  <option>Large</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Gender</label>
                <select className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                  <option>Any</option>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Location</label>
                <select className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                  <option>All locations</option>
                  <option>Colombo</option>
                  <option>Kandy</option>
                  <option>Galle</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Matches grid */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Finding your perfect matches...</p>
          </div>
        ) : matches.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((pet) => (
              <div
                key={pet.id}
                className="bg-card border border-border rounded-2xl overflow-hidden group hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={pet.image || "/placeholder.svg"}
                    alt={pet.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Compatibility badge */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <Badge
                      className={cn(
                        "text-sm font-semibold",
                        pet.compatibility >= 90
                          ? "bg-accent text-accent-foreground"
                          : pet.compatibility >= 80
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground",
                        pet.compatibility === 0 && "hidden"
                      )}
                    >
                      {pet.compatibility}% Match
                    </Badge>
                    {pet.is_foster && (
                      <Badge className="bg-orange-500 text-white border-none">
                        Foster to Adopt
                      </Badge>
                    )}
                  </div>

                  {/* Favorite button */}
                  <button
                    onClick={() => toggleFavorite(pet.id)}
                    className="absolute top-4 right-4 w-10 h-10 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors hover:bg-card"
                  >
                    <Heart
                      className={cn(
                        "w-5 h-5 transition-colors",
                        favorites.includes(pet.id) ? "fill-primary text-primary" : "text-muted-foreground",
                      )}
                    />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{pet.name}</h3>
                      <p className="text-muted-foreground">{pet.breed}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {pet.age}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {pet.location}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {pet.traits.map((trait: string) => (
                      <Badge key={trait} variant="secondary" className="text-xs">
                        {trait}
                      </Badge>
                    ))}
                  </div>

                  <Button className="w-full" asChild>
                    <Link href={`/pet/${pet.id}`}>
                      {pet.is_foster ? "Learn More & Foster" : "View Profile"}
                    </Link>
                  </Button>

                  {pet.reasons && pet.reasons.length > 0 && (
                    <p className="mt-3 text-xs text-accent font-medium flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {pet.reasons[0]}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-bold mb-2">No matches found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your filters or taking the quiz again.</p>
            <Button asChild>
              <Link href="/quiz">Take Paws-onality Quiz</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
