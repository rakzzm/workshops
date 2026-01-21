"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"


export function PaymentSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Payment Gateways</h3>
        <p className="text-sm text-muted-foreground">
          Configure how you accept payments from your customers.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <span className="font-bold">Stripe</span>
                    <span className="text-xs text-muted-foreground">(Credit Cards)</span>
                </div>
                {/* Fallback switch since Switch component might be missing/broken based on prev context, 
                    but I removed the broken import in notification-settings. 
                    I'll use a simple HTML checkbox mock here to avoid build errors if Switch isn't available. 
                    Actually, let's try to use the UI component if it exists or fallback safely.
                    I'll assume ShadCN Switch is likely not fully set up or caused issues before.
                    I'll use a simple toggle for safety.
                */}
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
            </div>
            <div className="grid gap-2 pl-4 border-l-2 border-muted">
                <div className="grid gap-1">
                    <Label htmlFor="stripe-key">Publishable Key</Label>
                    <Input id="stripe-key" type="password" value="pk_test_..." readOnly />
                </div>
                <div className="grid gap-1">
                    <Label htmlFor="stripe-secret">Secret Key</Label>
                    <Input id="stripe-secret" type="password" value="sk_test_..." readOnly />
                </div>
            </div>
        </div>

        <div className="border rounded-lg p-4 flex items-center justify-between">
             <div>
                <span className="font-bold">Cash on Delivery</span>
                <p className="text-sm text-muted-foreground">Accept cash payments at the workshop.</p>
             </div>
             <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
        </div>
      </div>
    </div>
  )
}
