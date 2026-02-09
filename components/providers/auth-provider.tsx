"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
    id: number
    email: string
    name: string

    role?: string
    shelter_name?: string
    verification_status?: string

    nic?: string
    phone_number?: string
    email_notifications?: boolean
    sms_alerts?: boolean
    created_at?: string
    pawsonality_results?: string | null
    unread_messages?: number
    pending_applications?: number

}

interface AuthContextType {
    user: User | null
    token: string | null
    login: (token: string, user: User) => void
    logout: () => void
    refreshUser: (user: User) => void
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Check for user in sessionStorage on mount
        const storedUser = sessionStorage.getItem("user")
        const storedToken = sessionStorage.getItem("token")

        if (storedUser && storedToken) {
            try {
                setUser(JSON.parse(storedUser))
                setToken(storedToken)
            } catch (error) {
                console.error("Failed to parse user from sessionStorage", error)
                // Clear invalid data
                sessionStorage.removeItem("user")
                sessionStorage.removeItem("token")
            }
        }
        setIsLoading(false)
    }, [])

    const login = (newToken: string, newUser: User) => {
        sessionStorage.setItem("token", newToken)
        sessionStorage.setItem("user", JSON.stringify(newUser))
        setToken(newToken)
        setUser(newUser)
        // Optional: redirect or let the component handle it
    }

    const logout = () => {
        sessionStorage.removeItem("token")
        sessionStorage.removeItem("user")
        localStorage.removeItem("pawmatch_matches")
        localStorage.removeItem("pawmatch_quiz_timestamp")
        setToken(null)
        setUser(null)
        router.push("/login")
    }

    const refreshUser = (updatedUser: User) => {
        sessionStorage.setItem("user", JSON.stringify(updatedUser))
        setUser(updatedUser)
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, refreshUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
