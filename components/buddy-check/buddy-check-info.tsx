import { Card } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Info } from "lucide-react"

export function BuddyCheckInfo() {
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex gap-4">
          <Info className="w-6 h-6 text-primary flex-shrink-0" />
          <div>
            <h3 className="font-semibold mb-2">What is Buddy-Check?</h3>
            <p className="text-sm text-muted-foreground">
              Our cross-reference tool analyzes the temperament of your current pets against shelter dogs' social
              profiles to predict compatibility and prevent conflicts.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">What We Analyze</h3>
        <div className="space-y-4">
          <div className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm mb-1">Play Style Compatibility</p>
              <p className="text-sm text-muted-foreground">Does your pet's energy level match the shelter dog?</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm mb-1">Social Hierarchy</p>
              <p className="text-sm text-muted-foreground">Will dominant/submissive traits create conflict?</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm mb-1">Resource Guarding</p>
              <p className="text-sm text-muted-foreground">Potential for food or toy aggression between pets</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm mb-1">Age & Size Matching</p>
              <p className="text-sm text-muted-foreground">Physical compatibility for safe play</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-amber-50 border-amber-200">
        <div className="flex gap-4">
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold mb-2 text-amber-900">Important Note</h3>
            <p className="text-sm text-amber-800 mb-3">
              While Buddy-Check provides data-driven insights, we always recommend:
            </p>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• Supervised first meetings in neutral territory</li>
              <li>• Gradual introductions over several days</li>
              <li>• Professional trainer consultation if needed</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Compatibility Scores Explained</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-16 h-2 bg-green-500 rounded-full" />
            <div className="flex-1">
              <p className="font-medium text-sm">90-100%</p>
              <p className="text-xs text-muted-foreground">Excellent match - highly compatible</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-16 h-2 bg-blue-500 rounded-full" />
            <div className="flex-1">
              <p className="font-medium text-sm">70-89%</p>
              <p className="text-xs text-muted-foreground">Good match - manageable differences</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-16 h-2 bg-yellow-500 rounded-full" />
            <div className="flex-1">
              <p className="font-medium text-sm">50-69%</p>
              <p className="text-xs text-muted-foreground">Moderate - requires careful introduction</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-16 h-2 bg-red-500 rounded-full" />
            <div className="flex-1">
              <p className="font-medium text-sm">Below 50%</p>
              <p className="text-xs text-muted-foreground">Low compatibility - not recommended</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
