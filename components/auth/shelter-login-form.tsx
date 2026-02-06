"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"

export function ShelterLoginForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const { login } = useAuth()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        const form = e.target as HTMLFormElement
        const email = (form.elements.namedItem('email') as HTMLInputElement)?.value
        const password = (form.elements.namedItem('password') as HTMLInputElement)?.value

        try {
            const res = await fetch("http://localhost:5000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, requiredRole: 'shelter' }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Login failed")
            }

            // Save token
            login(data.token, data.user)

            // Redirect based on role
            if (data.user.role === 'admin') {
                router.push("/admin/dashboard")
            } else if (data.user.role === 'shelter') {
                router.push("/shelters/dashboard")
            } else {
                // If an adopter tries to log in here, redirect them to home, but maybe warn?
                // Ideally we'd restrict this login to shelters only, but reuse is fine for now.
                router.push("/")
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/shelters" className="inline-flex items-center gap-2 mb-4">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                            <Building className="w-7 h-7 text-primary-foreground" />
                        </div>
                    </Link>
                    <h1 className="text-2xl font-bold text-foreground mb-2">Shelter Partner Login</h1>
                    <p className="text-muted-foreground">Access your shelter management dashboard</p>
                </div>

                {/* Form */}
                <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg text-center">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input id="email" name="email" type="email" placeholder="shelter@example.com" className="pl-10" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    className="pl-10 pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                            {isLoading ? "Signing in..." : "Access Dashboard"}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-muted-foreground">
                            New partner?{" "}
                            <Link href="/shelters/register" className="text-primary font-medium hover:underline">
                                Register your shelter
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Adopter link */}
                <div className="mt-6 text-center">
                    <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
                        Looking to adopt? Sign in as a user →
                    </Link>
                </div>
            </div>
        </div>
    )
}
