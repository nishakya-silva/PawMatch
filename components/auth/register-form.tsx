"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dog, Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, CreditCard, AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function RegisterForm() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [nic, setNic] = useState("")
    const [nicValidation, setNicValidation] = useState<{ valid: boolean; message: string } | null>(null)

    const validateNIC = async (value: string) => {
        if (!value.trim()) {
            setNicValidation(null)
            return
        }

        try {
            const res = await fetch("http://localhost:5000/api/validate-nic", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nic: value }),
            })
            const data = await res.json()

            if (data.valid) {
                setNicValidation({
                    valid: true,
                    message: `Valid ${data.type} NIC • ${data.gender} • Born ${data.birthYear}`
                })
            } else {
                setNicValidation({ valid: false, message: data.error || "Invalid NIC" })
            }
        } catch (err) {
            setNicValidation({ valid: false, message: "Unable to validate NIC" })
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        const formData = new FormData(e.currentTarget)
        const name = formData.get("name")
        const email = formData.get("email")
        const phone = formData.get("phone")
        const nicValue = formData.get("nic")
        const password = formData.get("password")

        // Validate NIC before submission
        if (!nicValidation || !nicValidation.valid) {
            setError("Please enter a valid NIC number")
            setIsLoading(false)
            return
        }

        try {
            const res = await fetch("http://localhost:5000/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, phone, nic: nicValue, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Registration failed")
            }

            // Success
            router.push(`/verify-email?email=${encodeURIComponent(email as string)}`)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-4">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                            <Dog className="w-7 h-7 text-primary-foreground" />
                        </div>
                    </Link>
                    <h1 className="text-2xl font-bold text-foreground mb-2">Create Account</h1>
                    <p className="text-muted-foreground">Join the PawMatch community today</p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input id="name" name="name" type="text" placeholder="John Doe" className="pl-10" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input id="email" name="email" type="email" placeholder="you@example.com" className="pl-10" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone (Optional)</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input id="phone" name="phone" type="tel" placeholder="+1 (555) 000-0000" className="pl-10" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nic">
                                National Identity Card (NIC) <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    id="nic"
                                    name="nic"
                                    type="text"
                                    placeholder="123456789V or 200012345678"
                                    className={`pl-10 pr-10 ${nicValidation ? (nicValidation.valid ? 'border-green-500' : 'border-destructive') : ''}`}
                                    value={nic}
                                    onChange={(e) => {
                                        const value = e.target.value
                                        setNic(value)
                                        validateNIC(value)
                                    }}
                                    required
                                />
                                {nicValidation && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {nicValidation.valid ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 text-destructive" />
                                        )}
                                    </div>
                                )}
                            </div>
                            {nicValidation && (
                                <p className={`text-xs ${nicValidation.valid ? 'text-green-600' : 'text-destructive'} flex items-center gap-1`}>
                                    {nicValidation.message}
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Enter your Sri Lankan NIC (Old: 9 digits + V/X, New: 12 digits)
                            </p>
                        </div>



                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a password"
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
                            {isLoading ? "Creating Account..." : "Sign Up"}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/login" className="text-primary font-medium hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
