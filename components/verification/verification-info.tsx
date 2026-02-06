import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Shield, Lock, AlertTriangle, CheckCircle } from "lucide-react"

export function VerificationInfo() {
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex gap-4">
          <Shield className="w-6 h-6 text-primary flex-shrink-0" />
          <div>
            <h3 className="font-semibold mb-2">Why Verify Identity?</h3>
            <p className="text-sm text-muted-foreground">
              Identity verification helps us prevent dog flipping, fraud, and ensures that every adoption is legitimate
              and safe for the animals.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          Your Privacy is Protected
        </h3>
        <ul className="space-y-3 text-sm">
          <li className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span>All data is encrypted end-to-end</span>
          </li>
          <li className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span>Documents deleted after verification</span>
          </li>
          <li className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span>No data shared with third parties</span>
          </li>
          <li className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span>Compliant with data protection laws</span>
          </li>
        </ul>
      </Card>

      <Card className="p-6 bg-amber-50 border-amber-200">
        <div className="flex gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold mb-2 text-amber-900">Preventing Dog Flipping</h3>
            <p className="text-sm text-amber-800">
              Dog flipping is when someone adopts animals to resell them for profit. Your verification helps us stop
              this harmful practice and protect vulnerable animals.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">What We Check</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="font-medium text-sm">Document Authenticity</span>
            </div>
            <p className="text-sm text-muted-foreground ml-4">Verify that your ID is genuine and valid</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="font-medium text-sm">Facial Match</span>
            </div>
            <p className="text-sm text-muted-foreground ml-4">Confirm your selfie matches your ID photo</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="font-medium text-sm">Adoption History</span>
            </div>
            <p className="text-sm text-muted-foreground ml-4">Check for patterns of suspicious behavior</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-accent">
        <h3 className="font-semibold mb-2">Need Help?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Having trouble with verification? Our support team is here to help.
        </p>
        <Button variant="outline" className="w-full bg-transparent">
          Contact Support
        </Button>
      </Card>
    </div>
  )
}
