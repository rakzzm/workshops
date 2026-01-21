"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SecuritySettings() {
  return (
    <div className="space-y-6">
        <div>
            <h3 className="text-lg font-medium">Security</h3>
            <p className="text-sm text-muted-foreground">
                Manage your password and security preferences.
            </p>
        </div>

        <div className="grid gap-4 max-w-xl">
             <div className="grid gap-2">
                <Label htmlFor="current">Current Password</Label>
                <Input id="current" type="password" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="new">New Password</Label>
                <Input id="new" type="password" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="confirm">Confirm Password</Label>
                <Input id="confirm" type="password" />
            </div>
            <Button>Update Password</Button>
        </div>

        <div className="border-t pt-6">
            <h4 className="text-sm font-medium mb-4">Two-Factor Authentication</h4>
            <div className="flex items-center justify-between p-4 border rounded-md bg-muted/50">
                <div>
                   <p className="font-medium">2FA is currently OFF</p>
                   <p className="text-sm text-muted-foreground">Secure your account with an extra layer of protection.</p>
                </div>
                <Button variant="outline">Enable 2FA</Button>
            </div>
        </div>
    </div>
  )
}
