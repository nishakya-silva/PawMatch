"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/ui/navigation"
import { Footer } from "@/components/ui/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X, Dog, CheckCircle } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"

export default function AddPetPage() {
    const router = useRouter()
    const { user, isLoading: authLoading } = useAuth()
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/shelters/signin')
        } else if (!authLoading && user?.role !== 'shelter') {
            router.push('/')
        }
    }, [user, authLoading, router])

    if (authLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-muted/30">Loading...</div>
    }

    if (!user || user.role !== 'shelter') {
        return null
    }
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        name: "",
        type: "Dog",
        breed: "",
        age: "",
        gender: "Male",
        size: "Medium",
        weight: "",
        energy_level: "5",
        description: "",
        is_vaccinated: false,
        is_neutered: false,
        is_microchipped: false,
        is_health_checked: false,
        is_foster: false,
        temperament: '{"cuddle_factor": 5, "tags": []}',
        social_profile: '{"dogs": true, "cats": false, "kids": true}',
        living_situation_match: '{"apartment": true, "house_small": true, "house_large": true, "rural": true}'
    })
    const [imageFile, setImageFile] = useState<File | null>(null)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const toggleTag = (tag: string) => {
        const temp = JSON.parse(formData.temperament)
        const tags = temp.tags || []
        const newTags = tags.includes(tag) ? tags.filter((t: string) => t !== tag) : [...tags, tag]
        setFormData(prev => ({ ...prev, temperament: JSON.stringify({ ...temp, tags: newTags }) }))
    }

    const toggleLiving = (field: string) => {
        const living = JSON.parse(formData.living_situation_match)
        living[field] = !living[field]
        setFormData(prev => ({ ...prev, living_situation_match: JSON.stringify(living) }))
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const data = new FormData()
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value.toString())
            })

            if (imageFile) {
                data.append('image', imageFile)
            }

            if (user?.id) {
                data.append('shelter_id', user.id.toString())
            }

            const res = await fetch('http://localhost:5000/api/pets', {
                method: 'POST',
                body: data,
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || "Failed to add pet")
            }

            router.push('/shelters/dashboard')
        } catch (error) {
            console.error(error)
            alert("Failed to add pet. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <Navigation />
            <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Add a New Pet</CardTitle>
                            <CardDescription>
                                Create a comprehensive profile for a new animal in your shelter.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Image Upload Component */}
                                <div className="space-y-2">
                                    <Label>Pet Photo</Label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-32 h-32 border-2 border-dashed border-border rounded-xl flex items-center justify-center overflow-hidden bg-muted/50">
                                            {imagePreview ? (
                                                <>
                                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => { setImagePreview(null); setImageFile(null); }}
                                                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <Upload className="w-8 h-8 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="cursor-pointer"
                                                required
                                            />
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Supported formats: JPG, PNG, WEBP. Max size: 5MB.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Type</Label>
                                        <Select value={formData.type} onValueChange={(val) => handleSelectChange('type', val)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Dog">Dog</SelectItem>
                                                <SelectItem value="Cat">Cat</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="breed">Breed</Label>
                                        <Input id="breed" name="breed" value={formData.breed} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="age">Age</Label>
                                        <Input id="age" name="age" placeholder="e.g. 2 years" value={formData.age} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="gender">Gender</Label>
                                        <Select value={formData.gender} onValueChange={(val) => handleSelectChange('gender', val)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Male">Male</SelectItem>
                                                <SelectItem value="Female">Female</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="size">Size</Label>
                                        <Select value={formData.size} onValueChange={(val) => handleSelectChange('size', val)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Small">Small</SelectItem>
                                                <SelectItem value="Medium">Medium</SelectItem>
                                                <SelectItem value="Large">Large</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="weight">Weight (kg)</Label>
                                        <Input id="weight" name="weight" placeholder="e.g. 15" value={formData.weight} onChange={handleInputChange} />
                                    </div>
                                </div>

                                {/* Status Checks */}
                                <div className="space-y-4">
                                    <Label>Medical & Shelter Status</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {[
                                            { id: 'is_vaccinated', label: 'Vaccinated' },
                                            { id: 'is_neutered', label: 'Neutered' },
                                            { id: 'is_microchipped', label: 'Microchipped' },
                                            { id: 'is_health_checked', label: 'Health Checked' },
                                            { id: 'is_foster', label: 'Foster Available' },
                                        ].map((health) => (
                                            <div key={health.id}
                                                className={`flex items-center space-x-2 border p-3 rounded-lg transition-colors cursor-pointer ${formData[health.id as keyof typeof formData] ? 'bg-primary/5 border-primary/30' : 'hover:bg-accent/5'}`}
                                                onClick={() => setFormData(prev => ({ ...prev, [health.id]: !prev[health.id as keyof typeof prev] }))}>
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${formData[health.id as keyof typeof formData] ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                                                    {formData[health.id as keyof typeof formData] && <CheckCircle className="w-3 h-3 text-white" />}
                                                </div>
                                                <Label className="cursor-pointer text-sm">{health.label}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Compatibility */}
                                <div className="space-y-4">
                                    <Label>Compatibility & Behavior</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-xl bg-accent/5">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs uppercase text-muted-foreground font-bold">Social Profile</Label>
                                                <div className="grid grid-cols-1 gap-3">
                                                    {['dogs', 'cats', 'kids'].map((target) => (
                                                        <div key={target} className="flex items-center justify-between bg-background p-2 rounded-lg border">
                                                            <span className="text-sm capitalize font-medium">Good with {target}?</span>
                                                            <Select
                                                                value={JSON.parse(formData.social_profile)[target] ? "yes" : "no"}
                                                                onValueChange={(val) => {
                                                                    const social = JSON.parse(formData.social_profile)
                                                                    social[target] = val === "yes"
                                                                    setFormData(prev => ({ ...prev, social_profile: JSON.stringify(social) }))
                                                                }}
                                                            >
                                                                <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="yes">Yes</SelectItem>
                                                                    <SelectItem value="no">No</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs uppercase text-muted-foreground font-bold">Energy & Attention</Label>
                                                <div className="space-y-4 bg-background p-3 rounded-lg border">
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-xs font-medium">
                                                            <span>Energy Level</span>
                                                            <span>{formData.energy_level}/10</span>
                                                        </div>
                                                        <input
                                                            type="range" min="1" max="10" step="1"
                                                            value={parseInt(formData.energy_level)}
                                                            onChange={(e) => handleSelectChange('energy_level', e.target.value)}
                                                            className="w-full accent-primary"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-xs font-medium">
                                                            <span>Cuddle Factor</span>
                                                            <span>{JSON.parse(formData.temperament).cuddle_factor}/10</span>
                                                        </div>
                                                        <input
                                                            type="range" min="1" max="10" step="1"
                                                            value={JSON.parse(formData.temperament).cuddle_factor}
                                                            onChange={(e) => {
                                                                const temp = JSON.parse(formData.temperament)
                                                                temp.cuddle_factor = parseInt(e.target.value)
                                                                setFormData(prev => ({ ...prev, temperament: JSON.stringify(temp) }))
                                                            }}
                                                            className="w-full accent-primary"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs uppercase text-muted-foreground font-bold">Living Situation</Label>
                                                <div className="grid grid-cols-1 gap-2 bg-background p-3 rounded-lg border">
                                                    {[
                                                        { id: 'apartment', label: 'Apartment' },
                                                        { id: 'house_small', label: 'Small House' },
                                                        { id: 'house_large', label: 'Large House w/ Yard' },
                                                        { id: 'rural', label: 'Rural/Farm' },
                                                    ].map((living) => (
                                                        <div key={living.id} className="flex items-center space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={JSON.parse(formData.living_situation_match)[living.id]}
                                                                onChange={() => toggleLiving(living.id)}
                                                                className="rounded border-border"
                                                            />
                                                            <span className="text-sm">{living.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs uppercase text-muted-foreground font-bold">Traits</Label>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {["Friendly", "Playful", "Quiet", "Shy", "Energetic", "Protective", "Trainable", "Sensitive", "Independent"].map((tag) => (
                                                        <button
                                                            key={tag}
                                                            type="button"
                                                            onClick={() => toggleTag(tag)}
                                                            className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold transition-colors ${JSON.parse(formData.temperament).tags?.includes(tag)
                                                                ? "bg-primary text-primary-foreground"
                                                                : "bg-background text-muted-foreground border hover:bg-muted/10"
                                                                }`}
                                                        >
                                                            {tag}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* About Section */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">About {formData.name || 'Pet'} (Story & Bio)</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        placeholder="Tell potential adopters about this pet's personality, history, and special needs..."
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={6}
                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full text-lg h-12" disabled={isLoading}>
                                    {isLoading ? "Processing..." : "Register Pet to Network"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    )
}
