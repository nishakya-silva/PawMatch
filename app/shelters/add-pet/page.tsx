"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/ui/navigation"
import { Footer } from "@/components/ui/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X } from "lucide-react"

export default function AddPetPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        name: "",
        type: "Dog",
        breed: "",
        age: "",
        gender: "Male",
        size: "Medium",
        energy_level: "moderate",
        description: "",
        temperament: "[]", // Default JSON string
        social_profile: '{"dogs": true, "cats": false, "kids": true}', // Default JSON
        living_situation_match: '{"apartment": true, "house_small": true, "house_large": true, "rural": true}' // Default JSON
    })
    const [imageFile, setImageFile] = useState<File | null>(null)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
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
                data.append(key, value)
            })

            if (imageFile) {
                data.append('image', imageFile)
            }

            const res = await fetch('http://localhost:5000/api/pets', {
                method: 'POST',
                body: data, // No Content-Type header needed, browser sets it for FormData
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || "Failed to add pet")
            }

            router.push('/matches') // Redirect to matches to see the new pet
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
                                create a profile for a new animal in your shelter.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">

                                {/* Image Upload */}
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="type">Type</Label>
                                        <Select value={formData.type} onValueChange={(val) => handleSelectChange('type', val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
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
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Male">Male</SelectItem>
                                                <SelectItem value="Female">Female</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="size">Size</Label>
                                        <Select value={formData.size} onValueChange={(val) => handleSelectChange('size', val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select size" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Small">Small</SelectItem>
                                                <SelectItem value="Medium">Medium</SelectItem>
                                                <SelectItem value="Large">Large</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="energy_level">Energy Level</Label>
                                        <Select value={formData.energy_level} onValueChange={(val) => handleSelectChange('energy_level', val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select energy" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sedentary">Sedentary</SelectItem>
                                                <SelectItem value="moderate">Moderate</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="athletic">Athletic</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={4}
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? "Adding Pet..." : "Register Pet"}
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
