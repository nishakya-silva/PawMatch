"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin } from "lucide-react"
import Link from "next/link"

const fosterPets = [
  {
    id: 1,
    name: "Luna",
    breed: "Mixed Breed",
    age: "2 years",
    location: "Colombo",
    image: "https://res.cloudinary.com/dd58qgsfx/image/upload/v1770356664/pawmatch/static/zc6enktpeo4fvn6n4evj.jpg",
    compatibility: 95,
    traits: ["Calm", "Good with kids", "House trained"],
  },
  {
    id: 2,
    name: "Rocky",
    breed: "Local Breed",
    age: "1 year",
    location: "Kandy",
    image: "https://res.cloudinary.com/dd58qgsfx/image/upload/v1770356662/pawmatch/static/f2knlxfmyo5mzhqaz3lp.jpg",
    compatibility: 88,
    traits: ["Energetic", "Loves walks", "Social"],
  },
  {
    id: 3,
    name: "Bella",
    breed: "Mixed Breed",
    age: "3 years",
    location: "Galle",
    image: "https://res.cloudinary.com/dd58qgsfx/image/upload/v1770356681/pawmatch/static/o5qc2jpoqjiet0bq9i7a.jpg",
    compatibility: 92,
    traits: ["Gentle", "Senior-friendly", "Quiet"],
  },
]

import { useState, useEffect } from "react"
import { toast } from "sonner"

export function FosterPetsSection() {
  const [pets, setPets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFosterPets = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/pets?is_foster=true&status=available')
        const data = await res.json()
        if (data.success) {
          setPets(data.pets)
        }
      } catch (err) {
        console.error("Foster pets fetch error:", err)
        toast.error("Failed to load foster pets")
      } finally {
        setLoading(false)
      }
    }
    fetchFosterPets()
  }, [])

  return (
    <section id="foster-pets" className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Available Foster Dogs</h2>
            <p className="text-muted-foreground">Dogs ready for their 14-day trial home</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/matches?browse=all">View All Pets</Link>
          </Button>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Finding foster dogs...</p>
          </div>
        ) : pets.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <Card key={pet.id} className="overflow-hidden hover:shadow-xl transition-shadow flex flex-col h-full">
                <div className="relative aspect-square">
                  <img src={pet.profile_image_url || "/placeholder.svg"} alt={pet.name} className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-accent text-accent-foreground">Foster to Adopt</Badge>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-2xl font-bold mb-1">{pet.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {pet.breed} • {pet.age}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4" />
                    {pet.shelter_name || "PawMatch Shelter"}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {(typeof pet.temperament === 'string' ? JSON.parse(pet.temperament) : (pet.temperament || [])).slice(0, 3).map((trait: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {trait}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-auto">
                    <Button className="w-full" asChild>
                      <Link href={`/pet/${pet.id}`}>Learn more & Foster</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-bold mb-2">No foster dogs currently available</h3>
            <p className="text-muted-foreground mb-6">Check back soon or browse our full adoption list.</p>
            <Button asChild>
              <Link href="/matches?browse=all">Browse All Dogs</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
