"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, MapPin, Share2, ArrowLeft, Check, Phone, Mail } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const petData = {
  id: 1,
  name: "Bruno",
  breed: "Golden Retriever Mix",
  age: "2 years",
  gender: "Male",
  weight: "28 kg",
  location: "Colombo Shelter",
  compatibility: 95,
  images: [
    "/placeholder.svg?height=600&width=600",
    "/placeholder.svg?height=600&width=600",
    "/placeholder.svg?height=600&width=600",
  ],
  story:
    "Bruno was found wandering the streets of Colombo as a young pup. After being brought to our shelter, he quickly became a staff favorite with his gentle nature and love for belly rubs. He's been with us for 8 months and is ready to find his forever home.",
  traits: {
    energyLevel: 80,
    friendliness: 95,
    trainability: 85,
    goodWithKids: 90,
    goodWithDogs: 85,
    goodWithCats: 60,
  },
  healthStatus: {
    vaccinated: true,
    neutered: true,
    microchipped: true,
    healthChecked: true,
  },
  compatibilityBreakdown: [
    { label: "Activity Match", score: 95, description: "Bruno's energy level matches your active lifestyle perfectly" },
    { label: "Space Compatibility", score: 92, description: "Great fit for a house with yard" },
    { label: "Family Fit", score: 98, description: "Excellent with children and families" },
    { label: "Experience Match", score: 90, description: "Suitable for your experience level" },
  ],
  shelter: {
    name: "Colombo Animal Welfare Center",
    phone: "+94 11 234 5678",
    email: "adopt@colomboshelter.lk",
    address: "123 Galle Road, Colombo 03",
  },
}

export function PetProfile() {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link
          href="/matches"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to matches
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
              <img
                src={petData.images[selectedImage] || "/placeholder.svg"}
                alt={petData.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {petData.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    "aspect-square rounded-xl overflow-hidden border-2 transition-all",
                    selectedImage === index ? "border-primary" : "border-transparent",
                  )}
                >
                  <img
                    src={img || "/placeholder.svg"}
                    alt={`${petData.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Info */}
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">{petData.name}</h1>
                  <Badge className="bg-accent text-accent-foreground text-sm">{petData.compatibility}% Match</Badge>
                </div>
                <p className="text-lg text-muted-foreground">{petData.breed}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setIsFavorite(!isFavorite)}>
                  <Heart className={cn("w-5 h-5", isFavorite && "fill-primary text-primary")} />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-muted p-4 rounded-xl text-center">
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="font-semibold text-foreground">{petData.age}</p>
              </div>
              <div className="bg-muted p-4 rounded-xl text-center">
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-semibold text-foreground">{petData.gender}</p>
              </div>
              <div className="bg-muted p-4 rounded-xl text-center">
                <p className="text-sm text-muted-foreground">Weight</p>
                <p className="font-semibold text-foreground">{petData.weight}</p>
              </div>
              <div className="bg-muted p-4 rounded-xl text-center">
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-semibold text-foreground text-sm">{petData.location}</p>
              </div>
            </div>

            {/* Health status */}
            <div className="flex flex-wrap gap-3">
              {Object.entries(petData.healthStatus).map(([key, value]) => (
                <Badge
                  key={key}
                  variant={value ? "default" : "secondary"}
                  className={cn(value && "bg-accent text-accent-foreground")}
                >
                  {value && <Check className="w-3 h-3 mr-1" />}
                  {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                </Badge>
              ))}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="compatibility" className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
                <TabsTrigger value="story">Story</TabsTrigger>
                <TabsTrigger value="traits">Traits</TabsTrigger>
              </TabsList>

              <TabsContent value="compatibility" className="space-y-4 mt-4">
                {petData.compatibilityBreakdown.map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{item.label}</span>
                      <span className="text-sm text-primary font-semibold">{item.score}%</span>
                    </div>
                    <Progress value={item.score} className="h-2" />
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="story" className="mt-4">
                <p className="text-foreground leading-relaxed">{petData.story}</p>
              </TabsContent>

              <TabsContent value="traits" className="space-y-4 mt-4">
                {Object.entries(petData.traits).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">
                        {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                      </span>
                      <span className="text-sm text-muted-foreground">{value}%</span>
                    </div>
                    <Progress value={value} className="h-2" />
                  </div>
                ))}
              </TabsContent>
            </Tabs>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="flex-1" onClick={async () => {
                try {
                  // Mock userId = 1
                  await fetch('http://localhost:5000/api/adopt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ petId: petData.id, userId: 1 })
                  });
                  alert('Application Submitted!');
                } catch (e) {
                  console.error(e);
                }
              }}>
                Start Adoption Process
              </Button>
              <Button size="lg" variant="outline" className="flex-1 bg-transparent">
                Schedule a Visit
              </Button>
            </div>

            {/* Shelter info */}
            <div className="bg-muted/50 border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">{petData.shelter.name}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  {petData.shelter.phone}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  {petData.shelter.email}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {petData.shelter.address}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
