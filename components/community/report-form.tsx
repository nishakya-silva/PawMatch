"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Camera, AlertTriangle, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function CommunityReportForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [formData, setFormData] = useState({
    animalType: "",
    condition: "",
    location: "",
    description: "",
    contactName: "",
    contactPhone: "",
    images: [] as File[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.animalType || !formData.condition || !formData.location) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('http://localhost:5000/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json()

      if (data.success) {
        toast.success("Report submitted successfully! Thank you for helping.")

        // Save to my reports
        const myReports = JSON.parse(localStorage.getItem('pawmatch_my_reports') || '[]')
        myReports.push(data.reportId)
        localStorage.setItem('pawmatch_my_reports', JSON.stringify(myReports))

        setFormData({
          animalType: "",
          condition: "",
          location: "",
          description: "",
          contactName: "",
          contactPhone: "",
          images: [],
        })
      } else {
        toast.error(data.error || "Failed to submit report")
      }
    } catch (error) {
      console.error("Submission error:", error)
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGetLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser")
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          // Reverse geocoding with Nominatim (Free/Public)
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          const data = await res.json()
          if (data.display_name) {
            setFormData(prev => ({ ...prev, location: data.display_name }))
            toast.success("Location detected!")
          } else {
            setFormData(prev => ({ ...prev, location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` }))
          }
        } catch (err) {
          setFormData(prev => ({ ...prev, location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` }))
        } finally {
          setIsLocating(false)
        }
      },
      (error) => {
        console.error("Geolocation error:", error)
        setIsLocating(false)

        switch (error.code) {
          case 1:
            toast.error("Location permission denied. Please allow access in your browser.")
            break
          case 2:
            toast.error("Position unavailable. Try moving to a better spot.")
            break
          case 3:
            toast.error("Location request timed out. Try again.")
            break
          default:
            toast.error("Error detecting location.")
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
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
                className={`p-4 rounded-lg border-2 transition-all ${formData.animalType === type ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
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
                className={`p-4 rounded-lg border-2 text-left transition-all ${formData.condition === condition.value
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
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleGetLocation}
              disabled={isLocating}
            >
              {isLocating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <MapPin className="w-5 h-5 text-primary" />
              )}
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

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Report"
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          By submitting, you agree that the information provided is accurate to the best of your knowledge.
        </p>
      </form>
    </Card>
  )
}
