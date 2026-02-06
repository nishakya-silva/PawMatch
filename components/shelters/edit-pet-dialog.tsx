"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Upload, X, CheckCircle } from "lucide-react"

interface EditPetDialogProps {
    pet: any
    isOpen: boolean
    onClose: () => void
    onUpdate: () => void
}

export function EditPetDialog({ pet, isOpen, onClose, onUpdate }: EditPetDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [formData, setFormData] = useState<any>(null)

    useEffect(() => {
        if (pet) {
            setFormData({
                name: pet.name || "",
                type: pet.type || "Dog",
                breed: pet.breed || "",
                age: pet.age || "",
                gender: pet.gender || "Male",
                size: pet.size || "Medium",
                weight: pet.weight || "",
                energy_level: pet.energy_level || "5",
                description: pet.description || "",
                is_vaccinated: pet.is_vaccinated === 1 || pet.is_vaccinated === true,
                is_neutered: pet.is_neutered === 1 || pet.is_neutered === true,
                is_microchipped: pet.is_microchipped === 1 || pet.is_microchipped === true,
                is_health_checked: pet.is_health_checked === 1 || pet.is_health_checked === true,
                is_foster: pet.is_foster === 1 || pet.is_foster === true,
                status: pet.status || 'available',
                temperament: typeof pet.temperament === 'string' ? pet.temperament : JSON.stringify(pet.temperament || { cuddle_factor: 5, tags: [] }),
                social_profile: typeof pet.social_profile === 'string' ? pet.social_profile : JSON.stringify(pet.social_profile || { dogs: true, cats: false, kids: true }),
                living_situation_match: typeof pet.living_situation_match === 'string' ? pet.living_situation_match : JSON.stringify(pet.living_situation_match || { apartment: true, house_small: true, house_large: true, rural: true })
            })
            setImagePreview(pet.profile_image_url || pet.image_url || null)
        }
    }, [pet])

    if (!formData) return null

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev: any) => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [name]: value }))
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
            Object.entries(formData).forEach(([key, value]: [string, any]) => {
                if (value !== null && value !== undefined) {
                    data.append(key, value.toString())
                }
            })

            if (imageFile) {
                data.append('image', imageFile)
            }

            const res = await fetch(`http://localhost:5000/api/pets/${pet.id}`, {
                method: 'PUT',
                body: data,
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || "Failed to update pet")
            }

            onUpdate()
            onClose()
        } catch (error) {
            console.error(error)
            alert("Failed to update pet. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const parsedTemperament = (() => {
        try { return typeof formData.temperament === 'string' ? JSON.parse(formData.temperament) : formData.temperament }
        catch { return { cuddle_factor: 5, tags: [] } }
    })()

    const parsedSocial = (() => {
        try { return typeof formData.social_profile === 'string' ? JSON.parse(formData.social_profile) : formData.social_profile }
        catch { return { dogs: true, cats: false, kids: true } }
    })()

    const parsedLiving = (() => {
        try { return typeof formData.living_situation_match === 'string' ? JSON.parse(formData.living_situation_match) : formData.living_situation_match }
        catch { return { apartment: true, house_small: true, house_large: true, rural: true } }
    })()

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Pet Profile: {pet.name}</DialogTitle>
                    <DialogDescription>
                        Update any details for this pet. Changes will be reflected immediately.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Image Section */}
                    <div className="flex items-center gap-4 p-4 border rounded-xl bg-muted/30">
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-primary/20">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                    <Upload className="w-8 h-8 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="image">Update Photo</Label>
                            <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="h-8 text-xs" />
                            <p className="text-[10px] text-muted-foreground">Keep current image or upload a new one.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={formData.status} onValueChange={(val) => handleSelectChange('status', val)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="adopted">Adopted</SelectItem>
                                    <SelectItem value="fostered">Fostered</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="breed">Breed</Label>
                            <Input id="breed" name="breed" value={formData.breed} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="age">Age</Label>
                            <Input id="age" name="age" value={formData.age} onChange={handleInputChange} />
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
                            <Input id="weight" name="weight" value={formData.weight} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="energy_level">Energy Level (1-10)</Label>
                            <Input type="number" id="energy_level" name="energy_level" min="1" max="10" value={formData.energy_level} onChange={handleInputChange} />
                        </div>
                    </div>

                    {/* Health Toggles */}
                    <div className="space-y-3">
                        <Label>Health & Status Toggles</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[
                                { id: 'is_vaccinated', label: 'Vaccinated' },
                                { id: 'is_neutered', label: 'Neutered' },
                                { id: 'is_microchipped', label: 'Microchipped' },
                                { id: 'is_health_checked', label: 'Health Checked' },
                                { id: 'is_foster', label: 'Foster Available' },
                            ].map((item) => (
                                <div key={item.id}
                                    className={`flex items-center space-x-2 border p-2 rounded-lg transition-colors cursor-pointer ${formData[item.id] ? 'bg-primary/5 border-primary/30' : 'hover:bg-accent/5'}`}
                                    onClick={() => setFormData((prev: any) => ({ ...prev, [item.id]: !prev[item.id] }))}>
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${formData[item.id] ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                                        {formData[item.id] && <CheckCircle className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className="text-xs">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 p-4 border rounded-xl bg-accent/5">
                        <Label className="text-sm font-bold uppercase text-muted-foreground">Social & Behavior</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-xs font-semibold">Good with...</Label>
                                {['dogs', 'cats', 'kids'].map((target) => (
                                    <div key={target} className="flex items-center justify-between bg-background p-2 rounded-lg border">
                                        <span className="text-xs capitalize">Good with {target}?</span>
                                        <Select
                                            value={parsedSocial[target] ? "yes" : "no"}
                                            onValueChange={(val) => {
                                                const social = { ...parsedSocial }
                                                social[target] = val === "yes"
                                                setFormData((prev: any) => ({ ...prev, social_profile: JSON.stringify(social) }))
                                            }}
                                        >
                                            <SelectTrigger className="w-20 h-7 text-[10px]"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="yes">Yes</SelectItem>
                                                <SelectItem value="no">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-3">
                                <Label className="text-xs font-semibold">Traits</Label>
                                <div className="flex flex-wrap gap-1.5 bg-background p-2 rounded-lg border">
                                    {["Friendly", "Playful", "Quiet", "Shy", "Energetic", "Protective", "Trainable", "Sensitive", "Independent"].map((tag) => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => {
                                                const tags = parsedTemperament.tags || []
                                                const newTags = tags.includes(tag) ? tags.filter((t: string) => t !== tag) : [...tags, tag]
                                                setFormData((prev: any) => ({ ...prev, temperament: JSON.stringify({ ...parsedTemperament, tags: newTags }) }))
                                            }}
                                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${parsedTemperament.tags?.includes(tag)
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                                }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">About {formData.name}</Label>
                        <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={4} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
