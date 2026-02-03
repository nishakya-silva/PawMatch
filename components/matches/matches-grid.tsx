"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin, Calendar, SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const mockMatches = [
  {
    id: 1,
    name: "Bruno",
    breed: "Golden Retriever Mix",
    age: "2 years",
    gender: "Male",
    location: "Colombo Shelter",
    compatibility: 95,
    traits: ["Friendly", "Active", "Good with kids"],
    image: "/golden-retriever-mix-happy-dog.jpg",
  },
  {
    id: 2,
    name: "Bella",
    breed: "Local Mix",
    age: "4 years",
    gender: "Female",
    location: "Kandy Animal Care",
    compatibility: 92,
    traits: ["Calm", "Affectionate", "Cat-friendly"],
    image: "/brown-mixed-breed-dog-gentle.jpg",
  },
  // ... other mocks can remain as backup
]

export function MatchesGrid() {
  const [favorites, setFavorites] = useState<number[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [matches, setMatches] = useState<any[]>(mockMatches)

  useEffect(() => {
    const saved = localStorage.getItem('pawmatch_matches')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Transform backend data to frontend model if needed
        // Backend returns: { id, name, type, breed, age, gender, size, energy_level, matchScore, matchReasons... }
        // Frontend expects: { id, name, breed, age, gender, location, compatibility, traits, image }

        const validMatches = parsed.map((m: any) => ({
          id: m.id,
          name: m.name,
          breed: m.breed,
          age: m.age,
          gender: m.gender,
          location: "PawMatch Shelter", // placeholder
          compatibility: Math.round(m.matchScore),
          traits: m.matchReasons || JSON.parse(m.temperament || '[]'),
          image: m.image_url || "/placeholder.svg?height=400&width=400"
        }))

        if (validMatches.length > 0) {
          setMatches(validMatches)
        }
      } catch (e) {
        console.error("Failed to parse matches from storage", e)
      }
    }
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockMatches.map((pet) => (
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
                <div className="absolute top-4 left-4">
                  <Badge
                    className={cn(
                      "text-sm font-semibold",
                      pet.compatibility >= 90
                        ? "bg-accent text-accent-foreground"
                        : pet.compatibility >= 80
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground",
                    )}
                  >
                    {pet.compatibility}% Match
                  </Badge>
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

                {/* Traits */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {pet.traits.map((trait) => (
                    <Badge key={trait} variant="secondary" className="text-xs">
                      {trait}
                    </Badge>
                  ))}
                </div>

                <Button className="w-full" asChild>
                  <Link href={`/pet/${pet.id}`}>View Profile</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
