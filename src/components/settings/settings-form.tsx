"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SettingsForm() {
    // Basic form state could be added here
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Simulate save
        alert("Settings saved (simulation)")
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
            <div className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="shopName">Shop Name</Label>
                    <Input id="shopName" defaultValue="AutoFix Workshop" />
                </div>
                
                <div className="grid gap-2">
                    <Label htmlFor="email">Public Email</Label>
                    <Input id="email" type="email" defaultValue="contact@autofix.com" />
                </div>
                
                <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" defaultValue="+1 234 567 890" />
                </div>
                
                <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" defaultValue="123 Mechanic Lane, Auto City" />
                </div>
            </div>
            
            <Button type="submit">Save changes</Button>
        </form>
    )
}
