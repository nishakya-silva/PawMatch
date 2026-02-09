"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Menu, X, Heart, Dog, User as UserIcon, LogOut, MessageSquare } from "lucide-react"
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
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
  }

  const hasNotifications = user && ((user.unread_messages || 0) + (user.pending_applications || 0) > 0);

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
            {!isLoading && user?.role !== 'shelter' && user?.role !== 'admin' && (
              <>
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
              </>
            )}
            {!isLoading && !user && (
              <Link href="/shelters" className="text-muted-foreground hover:text-foreground transition-colors">
                For Shelters
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (

              <>
                {/* User Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full relative">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer">
                        {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                      </div>
                      {hasNotifications && (
                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-background" />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={user.role === 'shelter' ? "/shelters/dashboard" : user.role === 'admin' ? "/admin/dashboard" : "/profile"} className="cursor-pointer w-full flex items-center">
                        <UserIcon className="w-4 h-4 mr-2" />
                        {user.role === 'adopter' ? 'My Profile' : 'Dashboard'}
                        {hasNotifications && user.role === 'shelter' && (
                          <span className="ml-auto w-2 h-2 bg-red-500 rounded-full" />
                        )}
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === 'adopter' && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="cursor-pointer">
                          <Heart className="w-4 h-4 mr-2" />
                          My Matches
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user?.role === 'adopter' && (
                      <DropdownMenuItem asChild>
                        <Link href="/messages" className="cursor-pointer">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          My Messages
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {!isLoading && user?.role !== 'shelter' && user?.role !== 'admin' && (
                  <Button asChild>
                    <Link href="/quiz">
                      <Heart className="w-4 h-4 mr-2" />
                      Find Your Match
                    </Link>
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </>
            )}

          </div>

          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn("md:hidden overflow-hidden transition-all duration-300", isOpen ? "max-h-96" : "max-h-0")}>
        <div className="px-4 py-4 space-y-4 bg-background border-t border-border">
          {!isLoading && user?.role !== 'shelter' && user?.role !== 'admin' && (
            <>
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
            </>
          )}
          {!isLoading && !user && (
            <Link href="/shelters" className="block py-2 text-muted-foreground hover:text-foreground">
              For Shelters
            </Link>
          )}
          <div className="flex flex-col gap-2 pt-4 border-t border-border">
            {isLoading ? (
              <div className="space-y-2">
                <div className="w-full h-9 bg-muted animate-pulse rounded-md" />
                <div className="w-full h-9 bg-muted animate-pulse rounded-md" />
              </div>
            ) : user ? (
              <>
                {/* User Profile Section */}
                <div className="flex items-center gap-3 py-2">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                    {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
                <Button variant="outline" asChild>
                  <Link href={user.role === 'shelter' ? "/shelters/dashboard" : user.role === 'admin' ? "/admin/dashboard" : "/profile"}>
                    <UserIcon className="w-4 h-4 mr-2" />
                    {user.role === 'adopter' ? 'My Profile' : 'Dashboard'}
                  </Link>
                </Button>
                <Button variant="outline" onClick={handleLogout} className="text-destructive hover:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </>
            )}


            {!isLoading && user?.role !== 'shelter' && user?.role !== 'admin' && (
              <Button asChild>
                <Link href="/quiz">Find Your Match</Link>
              </Button>
            )}

          </div>
        </div>
      </div>
    </nav>
  )
}
