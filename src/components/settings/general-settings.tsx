"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function GeneralSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Store Profile</h3>
        <p className="text-sm text-muted-foreground">
          Manage your public store profile and contact information.
        </p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="shopName">Shop Name</Label>
          <Input id="shopName" defaultValue="AutoFix Workshop" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Support Email</Label>
          <Input id="email" type="email" defaultValue="support@autofix.com" />
        </div>
        <div className="grid gap-2">
            <Label htmlFor="currency">Currency</Label>
            <select 
                id="currency"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="INR">INR (₹)</option>
            </select>
        </div>
      </div>
      <Button>Save Changes</Button>
    </div>
  )
}
