"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Camera, AlertTriangle } from "lucide-react"

export function CommunityReportForm() {
  const [formData, setFormData] = useState({
    animalType: "",
    condition: "",
    location: "",
    description: "",
    contactName: "",
    contactPhone: "",
    images: [] as File[],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Report submitted:", formData)
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-semibold">Submit Report</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Animal Type */}
        <div>
          <label className="block text-sm font-medium mb-2">Animal Type</label>
          <div className="grid grid-cols-2 gap-3">
            {["Dog", "Cat", "Other"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, animalType: type })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.animalType === type ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Condition */}
        <div>
          <label className="block text-sm font-medium mb-2">Condition/Urgency</label>
          <div className="grid gap-3">
            {[
              { value: "injured", label: "Injured - Needs immediate help", color: "red" },
              { value: "abandoned", label: "Abandoned - Recently left", color: "orange" },
              { value: "stray", label: "Stray - No visible injury", color: "yellow" },
              { value: "atrisk", label: "At Risk - Unsafe environment", color: "orange" },
            ].map((condition) => (
              <button
                key={condition.value}
                type="button"
                onClick={() => setFormData({ ...formData, condition: condition.value })}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  formData.condition === condition.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full bg-${condition.color}-500`} />
                  <span>{condition.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium mb-2">Location</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter address or landmark"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="flex-1 px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button type="button" variant="outline" size="lg">
              <MapPin className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Or use current location</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            placeholder="Describe the animal's condition, behavior, and surroundings..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">Photos (Optional)</label>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">Click to upload or drag photos here</p>
            <p className="text-xs text-muted-foreground">Up to 5 photos, max 10MB each</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your Name</label>
            <input
              type="text"
              placeholder="Full name"
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="+94 XX XXX XXXX"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="flex-1 px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">We'll contact you for updates</p>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full">
          Submit Report
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          By submitting, you agree that the information provided is accurate to the best of your knowledge.
        </p>
      </form>
    </Card>
  )
}
