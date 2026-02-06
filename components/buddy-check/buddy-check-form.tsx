"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, X } from "lucide-react"

interface Pet {
  name: string
  species: string
  age: string
  temperament: string[]
  socialization: string
}

export function BuddyCheckForm() {
  const [currentPets, setCurrentPets] = useState<Pet[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Pet>({
    name: "",
    species: "dog",
    age: "",
    temperament: [],
    socialization: "",
  })

  const temperamentOptions = ["Playful", "Calm", "Energetic", "Shy", "Dominant", "Submissive", "Territorial", "Social"]

  const addPet = () => {
    if (formData.name && formData.age) {
      setCurrentPets([...currentPets, formData])
      setFormData({
        name: "",
        species: "dog",
        age: "",
        temperament: [],
        socialization: "",
      })
      setShowForm(false)
    }
  }

  const removePet = (index: number) => {
    setCurrentPets(currentPets.filter((_, i) => i !== index))
  }

  const toggleTemperament = (trait: string) => {
    setFormData({
      ...formData,
      temperament: formData.temperament.includes(trait)
        ? formData.temperament.filter((t) => t !== trait)
        : [...formData.temperament, trait],
    })
  }

  return (
    <Card className="p-8">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-semibold">Your Current Pets</h2>
      </div>

      {/* Current Pets List */}
      {currentPets.length > 0 && (
        <div className="space-y-4 mb-6">
          {currentPets.map((pet, index) => (
            <Card key={index} className="p-4 bg-accent/50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{pet.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {pet.species} • {pet.age}
                  </p>
                </div>
                <button onClick={() => removePet(index)} className="text-muted-foreground hover:text-destructive">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {pet.temperament.map((trait, i) => (
                  <Badge key={i} variant="secondary">
                    {trait}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Socialization: {pet.socialization}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Add Pet Form */}
      {!showForm && (
        <Button variant="outline" className="w-full mb-6 bg-transparent" onClick={() => setShowForm(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Add Current Pet
        </Button>
      )}

      {showForm && (
        <div className="space-y-6 mb-6 p-6 border-2 border-dashed border-border rounded-lg">
          <div>
            <label className="block text-sm font-medium mb-2">Pet Name</label>
            <input
              type="text"
              placeholder="Enter pet's name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Species</label>
            <div className="grid grid-cols-3 gap-3">
              {["dog", "cat", "other"].map((species) => (
                <button
                  key={species}
                  type="button"
                  onClick={() => setFormData({ ...formData, species })}
                  className={`p-3 rounded-lg border-2 capitalize transition-all ${
                    formData.species === species
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {species}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Age</label>
            <input
              type="text"
              placeholder="e.g., 3 years"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Temperament (select all that apply)</label>
            <div className="grid grid-cols-2 gap-2">
              {temperamentOptions.map((trait) => (
                <button
                  key={trait}
                  type="button"
                  onClick={() => toggleTemperament(trait)}
                  className={`p-3 rounded-lg border-2 text-sm transition-all ${
                    formData.temperament.includes(trait)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {trait}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Socialization Level</label>
            <div className="grid gap-3">
              {[
                { value: "high", label: "Highly socialized - loves meeting new dogs" },
                { value: "medium", label: "Moderately socialized - selective with other dogs" },
                { value: "low", label: "Low socialization - prefers to be alone" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, socialization: option.label })}
                  className={`p-4 rounded-lg border-2 text-left text-sm transition-all ${
                    formData.socialization === option.label
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={addPet}>
              Add Pet
            </Button>
          </div>
        </div>
      )}

      {currentPets.length > 0 && (
        <Button size="lg" className="w-full">
          Check Compatibility with Shelter Dogs
        </Button>
      )}

      {currentPets.length === 0 && !showForm && (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Add your current pets to check compatibility</p>
        </div>
      )}
    </Card>
  )
}
