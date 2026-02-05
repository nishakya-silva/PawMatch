"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dog, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

export function VerifyForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const defaultEmail = searchParams.get("email") || ""

    const [email, setEmail] = useState(defaultEmail)
    const [otp, setOtp] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")

    const handleResend = async () => {
        setIsLoading(true)
        setMessage("")
        setError("")
        try {
            const res = await fetch("http://localhost:5000/api/resend-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to resend")
            setMessage("OTP resent successfully!")

        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")
        setMessage("")

        try {
            const res = await fetch("http://localhost:5000/api/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Verification failed")
            }

            setMessage("Email verified successfully! Redirecting...")

            // Save token if returned (auto login)
            if (data.token) {
                localStorage.setItem("token", data.token)
                localStorage.setItem("user", JSON.stringify(data.user))
            }

            // Redirect
            // Redirect
            window.location.href = "/profile"

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
                    <div className="inline-flex items-center gap-2 mb-4">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                            <Dog className="w-7 h-7 text-primary-foreground" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">Verify Email</h1>
                    <p className="text-muted-foreground">Enter the 6-digit code sent to your email</p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg text-center">
                                {error}
                            </div>
                        )}
                        {message && (
                            <div className="bg-green-500/10 text-green-600 text-sm p-3 rounded-lg text-center">
                                {message}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="otp">Verification Code</Label>
                            <Input
                                id="otp"
                                type="text"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                placeholder="123456"
                                className="text-center text-lg tracking-widest"
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...
                                </>
                            ) : (
                                <>
                                    Verify Account <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-muted-foreground text-sm">
                            Didn't receive code?{" "}
                            <button
                                type="button"
                                onClick={handleResend}
                                className="text-primary font-medium hover:underline"
                                disabled={isLoading}
                            >
                                Resend
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
