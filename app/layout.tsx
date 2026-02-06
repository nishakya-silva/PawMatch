import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/components/providers/auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PawMatch - Smart Pet Adoption Platform",
  description:
    "Find your perfect furry companion through data-driven compatibility matching. Reduce adoption returns and ensure lifelong bonds.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "https://res.cloudinary.com/dd58qgsfx/image/upload/v1770356671/pawmatch/static/gqzpethjvle8jcvnjrrk.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "https://res.cloudinary.com/dd58qgsfx/image/upload/v1770356670/pawmatch/static/es5wiyhtaaclfgoyt4of.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "https://res.cloudinary.com/dd58qgsfx/image/upload/v1770356655/pawmatch/static/rqqhy9ayvmi8uavk7fqg.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#c2633a",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          {children}
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}
