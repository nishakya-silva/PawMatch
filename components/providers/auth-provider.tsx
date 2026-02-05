"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
    id: number
    email: string
    name: string
    nic?: string
}

interface AuthContextType {
    user: User | null
    token: string | null
    login: (token: string, user: User) => void
    logout: () => void
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
        setToken(null)
        setUser(null)
        router.push("/login")
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
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
