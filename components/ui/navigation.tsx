"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Menu, X, Heart, Dog, User as UserIcon, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Dog className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">PawMatch</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/quiz" className="text-muted-foreground hover:text-foreground transition-colors">
              Take Quiz
            </Link>
            <Link href="/matches" className="text-muted-foreground hover:text-foreground transition-colors">
              Browse Matches
            </Link>
            <Link href="/foster-to-adopt" className="text-muted-foreground hover:text-foreground transition-colors">
              Foster to Adopt
            </Link>
            <Link href="/community-report" className="text-muted-foreground hover:text-foreground transition-colors">
              Report Animal
            </Link>
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              Welfare Tracker
            </Link>
            <Link href="/shelters" className="text-muted-foreground hover:text-foreground transition-colors">
              For Shelters
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  Hi, {user.name?.split(' ')[0] || 'User'}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            )}

            <Button asChild>
              <Link href="/quiz">
                <Heart className="w-4 h-4 mr-2" />
                Find Your Match
              </Link>
            </Button>
          </div>

          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn("md:hidden overflow-hidden transition-all duration-300", isOpen ? "max-h-96" : "max-h-0")}>
        <div className="px-4 py-4 space-y-4 bg-background border-t border-border">
          <Link href="/quiz" className="block py-2 text-muted-foreground hover:text-foreground">
            Take Quiz
          </Link>
          <Link href="/matches" className="block py-2 text-muted-foreground hover:text-foreground">
            Browse Matches
          </Link>
          <Link href="/foster-to-adopt" className="block py-2 text-muted-foreground hover:text-foreground">
            Foster to Adopt
          </Link>
          <Link href="/community-report" className="block py-2 text-muted-foreground hover:text-foreground">
            Report Animal
          </Link>
          <Link href="/dashboard" className="block py-2 text-muted-foreground hover:text-foreground">
            Welfare Tracker
          </Link>
          <Link href="/shelters" className="block py-2 text-muted-foreground hover:text-foreground">
            For Shelters
          </Link>
          <div className="flex flex-col gap-2 pt-4 border-t border-border">
            {user ? (
              <>
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium">Signed in as {user.name}</span>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Button variant="outline" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            )}
            <Button asChild>
              <Link href="/quiz">Find Your Match</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
