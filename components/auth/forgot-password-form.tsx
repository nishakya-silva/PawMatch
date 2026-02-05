"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dog, Mail, ArrowRight, ArrowLeft } from "lucide-react"
import Link from "next/link"

export function ForgotPasswordForm() {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const res = await fetch("http://localhost:5000/api/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Request failed")

            setIsSubmitted(true)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    if (isSubmitted) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 text-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Check your email</h2>
                    <p className="text-muted-foreground mb-6">
                        We've sent a password reset link to <br />
                        <span className="font-medium text-foreground">{email}</span>
                    </p>
                    <div className="space-y-4">
                        <Button variant="outline" className="w-full" asChild>
                            <Link href="/login">Return to Login</Link>
                        </Button>
                        <p className="text-sm text-muted-foreground">
                            Didn't receive the email? <button onClick={() => setIsSubmitted(false)} className="text-primary hover:underline">Try again</button>
                        </p>
                    </div>
                </div>
            </div>
        )
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
                    <h1 className="text-2xl font-bold text-foreground mb-2">Forgot password?</h1>
                    <p className="text-muted-foreground">No worries, we'll send you reset instructions.</p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-8">
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
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    className="pl-10"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                            {isLoading ? "Sending..." : "Reset Password"}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link href="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
