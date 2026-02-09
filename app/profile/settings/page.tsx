"use client"

import { Navigation } from "@/components/ui/navigation"
import { Footer } from "@/components/ui/footer"
import { SettingsPage } from "@/components/profile/settings-page"

export default function ProfileSettingsPage() {
    return (
        <div className="min-h-screen">
            <Navigation />
            <SettingsPage />
            <Footer />
        </div>
    )
}
