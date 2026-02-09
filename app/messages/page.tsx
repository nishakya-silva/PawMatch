"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/ui/navigation"
import { Footer } from "@/components/ui/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Calendar, User, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function UserMessagesPage() {
    const { user, token, isLoading, refreshUser } = useAuth()
    const router = useRouter()
    const [messages, setMessages] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login")
        }
    }, [user, isLoading, router])

    useEffect(() => {
        if (user && token) {
            fetchMessages()
        }
    }, [user, token])

    const fetchMessages = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/user/messages", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            const data = await res.json()
            if (data.success) {
                setMessages(data.messages)
                // Mark notifications as read
                fetch("http://localhost:5000/api/notifications/read", {
                    method: 'PUT',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ type: 'message' })

                }).then(() => {
                    if (user) refreshUser({ ...user, unread_messages: 0 });
                }).catch(err => console.error("Error marking read:", err));
            }
        } catch (error) {
            console.error("Error fetching messages:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading || isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-background">Loading...</div>
    }

    return (
        <div className="min-h-screen bg-background">
            <Navigation />
            <main className="container mx-auto px-4 py-8 mt-16 max-w-4xl">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/profile" className="text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <MessageSquare className="w-8 h-8 text-primary" />
                        My Messages
                    </h1>
                </div>

                {messages.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardHeader>
                            <CardTitle>No messages yet</CardTitle>
                            <CardDescription>
                                You haven't sent any messages to shelters.
                                <br />
                                Browse pets and use "Contact Shelter" to start a conversation!
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild>
                                <Link href="/matches">Browse Pets</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {messages.map((msg) => (
                            <Card key={msg.id} className="overflow-hidden border-l-4 border-l-primary">
                                <CardHeader className="bg-muted/30 pb-3">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <CardTitle className="text-lg">{msg.subject}</CardTitle>
                                                {msg.response ? <Badge variant="default" className="bg-green-600">Replied</Badge> : <Badge variant="outline">Sent</Badge>}
                                            </div>
                                            <CardDescription className="flex items-center gap-2">
                                                <span>To: {msg.shelter_name}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(msg.created_at).toLocaleDateString()}
                                                </span>
                                            </CardDescription>
                                        </div>
                                        {msg.pet_image && (
                                            <Link href={`/pet/${msg.pet_id}`} className="shrink-0 group">
                                                <img
                                                    src={msg.pet_image}
                                                    alt={msg.pet_name}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform"
                                                />
                                                <span className="sr-only">View {msg.pet_name}</span>
                                            </Link>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <div className="bg-muted/20 p-4 rounded-lg">
                                        <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                                    </div>

                                    {msg.response && (
                                        <div className="ml-4 pl-4 border-l-2 border-border mt-4">
                                            <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                Shelter Response
                                                <span className="text-[10px] ml-auto">
                                                    {msg.responded_at ? new Date(msg.responded_at).toLocaleDateString() : ''}
                                                </span>
                                            </p>
                                            <p className="text-sm bg-accent/10 p-3 rounded-md text-foreground">{msg.response}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    )
}
