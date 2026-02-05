import { ProfilePage } from "@/components/profile/profile-page"
import { Navigation } from "@/components/ui/navigation"
import { Footer } from "@/components/ui/footer"

export default function Profile() {
    return (
        <div className="min-h-screen">
            <Navigation />
            <ProfilePage />
            <Footer />
        </div>
    )
}
