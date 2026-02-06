"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Lock, Bell, Trash2, ArrowLeft, Shield } from "lucide-react"
import Link from "next/link"

export function SettingsPage() {
    const { user, token, logout, refreshUser } = useAuth()
    const router = useRouter()
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [notifications, setNotifications] = useState({
        email: user?.email_notifications ?? true,
        sms: user?.sms_alerts ?? false
    })

    useEffect(() => {
        if (user) {
            setNotifications({
                email: user.email_notifications ?? true,
                sms: user.sms_alerts ?? false
            })
        }
    }, [user])

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        if (!token) return

        setIsUpdatingPassword(true)
        try {
            const res = await fetch("http://localhost:5000/api/update-password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": token,
                },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword,
                }),
            })

            const data = await res.json()

            if (data.success) {
                toast.success("Password updated successfully")
                setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
            } else {
                toast.error(data.error || "Failed to update password")
            }
        } catch (error) {
            console.error("Update password error:", error)
            toast.error("An error occurred while updating your password")
        } finally {
            setIsUpdatingPassword(false)
        }
    }

    const handleToggleNotification = async (type: 'email' | 'sms') => {
        if (!token || !user) return

        const newSettings = {
            email_notifications: type === 'email' ? !notifications.email : notifications.email,
            sms_alerts: type === 'sms' ? !notifications.sms : notifications.sms
        }

        try {
            const res = await fetch("http://localhost:5000/api/notifications", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": token,
                },
                body: JSON.stringify(newSettings),
            })

            const data = await res.json()
            if (data.success) {
                setNotifications({
                    email: newSettings.email_notifications,
                    sms: newSettings.sms_alerts
                })
                refreshUser({
                    ...user,
                    ...newSettings
                })
                toast.success("Preferences updated")
            }
        } catch (error) {
            toast.error("Failed to update preferences")
        }
    }

    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you absolutely sure? This action cannot be undone and you will lose all your data.")) {
            return
        }

        if (!token) return

        setIsDeleting(true)
        try {
            const res = await fetch("http://localhost:5000/api/account", {
                method: "DELETE",
                headers: {
                    "x-auth-token": token,
                },
            })

            const data = await res.json()
            if (data.success) {
                toast.success("Account deleted successfully")
                logout()
            } else {
                toast.error(data.error || "Failed to delete account")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setIsDeleting(false)
        }
    }

    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen bg-muted/30 py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/profile" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Profile
                    </Link>
                    <h1 className="text-3xl font-bold">Account Settings</h1>
                </div>

                <div className="space-y-6">
                    {/* Security Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" />
                                Security Settings
                            </CardTitle>
                            <CardDescription>Update your password and security preferences</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form onSubmit={handleUpdatePassword} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="current-password">Current Password</Label>
                                    <Input
                                        id="current-password"
                                        type="password"
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <Input
                                        id="new-password"
                                        type="password"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                                    <Input
                                        id="confirm-password"
                                        type="password"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <Button type="submit" disabled={isUpdatingPassword}>
                                    {isUpdatingPassword ? "Updating..." : "Update Password"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Notifications Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="w-5 h-5 text-primary" />
                                Notifications
                            </CardTitle>
                            <CardDescription>Manage how you receive alerts and updates</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Email Notifications</p>
                                    <p className="text-sm text-muted-foreground">Receive updates about your adoption journey</p>
                                </div>
                                <Button
                                    variant={notifications.email ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleToggleNotification('email')}
                                >
                                    {notifications.email ? "Enabled" : "Enable"}
                                </Button>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">SMS Alerts</p>
                                    <p className="text-sm text-muted-foreground">Get welfare check reminders via SMS</p>
                                </div>
                                <Button
                                    variant={notifications.sms ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleToggleNotification('sms')}
                                >
                                    {notifications.sms ? "Enabled" : "Enable"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-destructive/20 bg-destructive/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-destructive">
                                <Trash2 className="w-5 h-5" />
                                Danger Zone
                            </CardTitle>
                            <CardDescription>Actions that cannot be undone</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Delete Account</p>
                                    <p className="text-sm text-muted-foreground">Permanently remove all your data from PawMatch</p>
                                </div>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleDeleteAccount}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? "Deleting..." : "Delete Account"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
