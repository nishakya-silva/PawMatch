"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, CheckCircle, AlertCircle, Clock } from "lucide-react"

interface VerifyShelterProps {
    status: string // 'unverified', 'pending', 'verified', 'rejected'
    userId: number
    onVerificationSubmitted: () => void
}

export function VerifyShelterCard({ status, userId, onVerificationSubmitted }: VerifyShelterProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [formData, setFormData] = useState({
        registry_type: "",
        registration_number: ""
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file || !formData.registry_type || !formData.registration_number) {
            alert("Please fill all fields and upload document")
            return
        }

        setIsLoading(true)
        try {
            const data = new FormData()
            data.append('userId', userId.toString())
            data.append('registry_type', formData.registry_type)
            data.append('registration_number', formData.registration_number)
            data.append('document', file)

            const token = sessionStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/shelters/verify-request', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: data
            })

            const result = await res.json()
            if (result.success) {
                onVerificationSubmitted()
            } else {
                alert(result.error || "Submission failed")
            }

        } catch (error) {
            console.error(error)
            alert("Submission failed")
        } finally {
            setIsLoading(false)
        }
    }

    if (status === 'verified') {
        return (
            <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6 flex items-center gap-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                        <h3 className="font-semibold text-green-900">Verified Partner</h3>
                        <p className="text-green-700 text-sm">Your shelter is fully verified and active.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (status === 'pending') {
        return (
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6 flex items-center gap-4">
                    <Clock className="w-8 h-8 text-blue-600" />
                    <div>
                        <h3 className="font-semibold text-blue-900">Verification Pending</h3>
                        <p className="text-blue-700 text-sm">Our admins are reviewing your documents. This usually takes 24-48 hours.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-l-4 border-l-primary shadow-md">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Get Verified</CardTitle>
                    {status === 'rejected' && <Badge variant="destructive">Previously Rejected</Badge>}
                </div>
                <CardDescription>
                    Verify your shelter to unlock all platform features and build trust with adopters.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Registry Type</Label>
                            <Select onValueChange={(val) => setFormData(docs => ({ ...docs, registry_type: val }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Authority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NGO Secretariat">NGO Secretariat</SelectItem>
                                    <SelectItem value="Department of Animal Production & Health">Department of Animal Production & Health</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Registration Number</Label>
                            <Input
                                placeholder="e.g. L-12345"
                                value={formData.registration_number}
                                onChange={(e) => setFormData(docs => ({ ...docs, registration_number: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Certificate of Registration (PDF or Image)</Label>
                        <Input type="file" accept=".pdf,image/*" onChange={handleFileChange} />
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                        {isLoading ? "Submitting..." : "Submit for Verification"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
