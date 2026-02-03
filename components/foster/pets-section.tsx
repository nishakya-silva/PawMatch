import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin } from "lucide-react"

const fosterPets = [
  {
    id: 1,
    name: "Luna",
    breed: "Mixed Breed",
    age: "2 years",
    location: "Colombo",
    image: "/friendly-brown-mixed-breed-dog.jpg",
    compatibility: 95,
    traits: ["Calm", "Good with kids", "House trained"],
  },
  {
    id: 2,
    name: "Rocky",
    breed: "Local Breed",
    age: "1 year",
    location: "Kandy",
    image: "/energetic-black-street-dog.jpg",
    compatibility: 88,
    traits: ["Energetic", "Loves walks", "Social"],
  },
  {
    id: 3,
    name: "Bella",
    breed: "Mixed Breed",
    age: "3 years",
    location: "Galle",
    image: "/sweet-white-and-brown-dog.jpg",
    compatibility: 92,
    traits: ["Gentle", "Senior-friendly", "Quiet"],
  },
]

export function FosterPetsSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Available Foster Dogs</h2>
            <p className="text-muted-foreground">Dogs ready for their trial home</p>
          </div>
          <Button variant="outline">View All</Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fosterPets.map((pet) => (
            <Card key={pet.id} className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative aspect-square">
                <img src={pet.image || "/placeholder.svg"} alt={pet.name} className="w-full h-full object-cover" />
                <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
                  <Heart className="w-5 h-5 text-muted-foreground" />
                </button>
                <div className="absolute top-4 left-4">
                  <Badge className="bg-primary text-primary-foreground">{pet.compatibility}% Match</Badge>
                </div>
              </div>

              <div className="p-6">
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
                  {pet.location}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {pet.traits.map((trait, index) => (
                    <Badge key={index} variant="secondary">
                      {trait}
                    </Badge>
                  ))}
                </div>

                <Button className="w-full">Start Foster Trial</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
