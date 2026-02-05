"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dog, Lock, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

export function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Get token and email from URL
    const token = searchParams.get("token")
    const email = searchParams.get("email")

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    if (!token || !email) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-destructive mb-2">Invalid Link</h2>
                    <p className="text-muted-foreground mb-4">This password reset link is invalid or incomplete.</p>
                    <Button asChild>
                        <Link href="/login">Back to Login</Link>
                    </Button>
                </div>
            </div>
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            const res = await fetch("http://localhost:5000/api/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, token, newPassword: password }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Reset failed")

            setSuccess(true)
            setTimeout(() => {
                router.push("/login")
            }, 3000)

        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 text-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Dog className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Password Reset Complete</h2>
                    <p className="text-muted-foreground mb-6">
                        Your password has been successfully updated. You will be redirected to the login page shortly.
                    </p>
                    <Button className="w-full" asChild>
                        <Link href="/login">Continue to Login</Link>
                    </Button>
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
                    <h1 className="text-2xl font-bold text-foreground mb-2">Set new password</h1>
                    <p className="text-muted-foreground">Please choose a strong password for your account.</p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="pl-10 pr-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                            {isLoading ? "Resetting..." : "Reset Password"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
