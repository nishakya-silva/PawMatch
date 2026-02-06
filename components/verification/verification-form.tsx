"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Shield, Upload, CheckCircle, Camera } from "lucide-react"

export function VerificationForm() {
  const [step, setStep] = useState<"id" | "selfie" | "complete">("id")
  const [idUploaded, setIdUploaded] = useState(false)
  const [selfieUploaded, setSelfieUploaded] = useState(false)

  return (
    <Card className="p-8">
      <div className="flex items-center gap-2 mb-8">
        <Shield className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-semibold">Verify Your Identity</h2>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className={`flex items-center gap-2 ${step === "id" ? "text-primary" : step === "selfie" || step === "complete" ? "text-green-600" : "text-muted-foreground"}`}
        >
          <div
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold ${step === "id" ? "border-primary" : step === "selfie" || step === "complete" ? "border-green-600 bg-green-600 text-white" : "border-muted-foreground"}`}
          >
            {step === "selfie" || step === "complete" ? <CheckCircle className="w-5 h-5" /> : "1"}
          </div>
          <span className="text-sm font-medium">Upload ID</span>
        </div>
        <div className="flex-1 h-0.5 bg-border" />
        <div
          className={`flex items-center gap-2 ${step === "selfie" ? "text-primary" : step === "complete" ? "text-green-600" : "text-muted-foreground"}`}
        >
          <div
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold ${step === "selfie" ? "border-primary" : step === "complete" ? "border-green-600 bg-green-600 text-white" : "border-muted-foreground"}`}
          >
            {step === "complete" ? <CheckCircle className="w-5 h-5" /> : "2"}
          </div>
          <span className="text-sm font-medium">Selfie</span>
        </div>
      </div>

      {step === "id" && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">ID Type</label>
            <div className="grid grid-cols-2 gap-3">
              {["National ID", "Passport", "Driving License"].map((type) => (
                <button
                  key={type}
                  type="button"
                  className="p-4 rounded-lg border-2 border-border hover:border-primary transition-all"
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Upload Document</label>
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-1">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
            </div>
          </div>

          <div className="bg-accent/50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Requirements:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Clear, readable photo of your ID</li>
              <li>• All corners visible</li>
              <li>• No glare or shadows</li>
              <li>• Document must be valid</li>
            </ul>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={() => {
              setIdUploaded(true)
              setStep("selfie")
            }}
          >
            Continue to Selfie Verification
          </Button>
        </div>
      )}

      {step === "selfie" && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Take a Selfie</label>
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-4">Position your face in the frame</p>
                <Button>Open Camera</Button>
              </div>
            </div>
          </div>

          <div className="bg-accent/50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Tips for a clear selfie:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Face the camera directly</li>
              <li>• Remove glasses and hat</li>
              <li>• Ensure good lighting</li>
              <li>• Keep a neutral expression</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" size="lg" className="flex-1 bg-transparent" onClick={() => setStep("id")}>
              Back
            </Button>
            <Button
              size="lg"
              className="flex-1"
              onClick={() => {
                setSelfieUploaded(true)
                setStep("complete")
              }}
            >
              Submit Verification
            </Button>
          </div>
        </div>
      )}

      {step === "complete" && (
        <div className="text-center py-8">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold mb-3">Verification Submitted!</h3>
          <p className="text-muted-foreground mb-6">
            We'll review your documents within 24 hours and notify you via email.
          </p>
          <Button size="lg" className="w-full">
            Continue to Matching
          </Button>
        </div>
      )}
    </Card>
  )
}
