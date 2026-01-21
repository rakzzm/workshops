"use client"

import { useState } from "react"
import { createTicket } from "@/app/actions/ticket-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2, LifeBuoy } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SupportPage() {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        
        const formData = new FormData(e.currentTarget)
        const data = {
            subject: formData.get('subject'),
            description: formData.get('description'),
            category: formData.get('category'),
            priority: formData.get('priority') || 'MEDIUM',
            // In a real app, these would come from auth session
            customerId: null, 
            vehicleId: null 
        }

        try {
            await createTicket(data)
            setSuccess(true)
            e.currentTarget.reset()
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                        <CardTitle>Ticket Submitted!</CardTitle>
                        <CardDescription>
                            We have received your request and will get back to you shortly depending on the priority of your issue.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="justify-center">
                        <Button onClick={() => setSuccess(false)}>Submit Another Ticket</Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg space-y-4">
                <div className="text-center space-y-2">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                        <LifeBuoy className="h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Workshop Support</h1>
                    <p className="text-slate-500">How can we help you today?</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Open a New Ticket</CardTitle>
                        <CardDescription>Please describe your issue in detail.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input id="subject" name="subject" required placeholder="e.g. Engine noise when braking" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select name="category" required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MECHANICAL">Mechanical Issue</SelectItem>
                                            <SelectItem value="BILLING">Billing / Invoice</SelectItem>
                                            <SelectItem value="SERVICE_QUALITY">Service Quality</SelectItem>
                                            <SelectItem value="OTHER">Other Inquiry</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Urgency</Label>
                                    <Select name="priority" defaultValue="MEDIUM">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LOW">Low (General Query)</SelectItem>
                                            <SelectItem value="MEDIUM">Medium (Standard)</SelectItem>
                                            <SelectItem value="HIGH">High (Urgent Repair)</SelectItem>
                                            <SelectItem value="CRITICAL">Critical (Breakdown)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea 
                                    id="description" 
                                    name="description" 
                                    required 
                                    placeholder="Please provide as much detail as possible..." 
                                    className="min-h-[120px]"
                                />
                            </div>

                            <Alert className="bg-blue-50 border-blue-100 text-blue-800">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Note</AlertTitle>
                                <AlertDescription className="text-xs">
                                    Expected resolution time varies by urgency. Critical issues are addressed within 4 hours.
                                </AlertDescription>
                            </Alert>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Submitting..." : "Submit Ticket"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
