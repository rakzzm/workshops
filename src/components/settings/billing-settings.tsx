"use client"

import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BillingSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Plan & Billing</h3>
        <p className="text-sm text-muted-foreground">
          Manage your subscription and payment methods.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
         <div className="border rounded-xl p-6 bg-card relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-bl-xl">
                CURRENT PLAN
            </div>
            <h4 className="font-bold text-xl mb-2">Pro Plan</h4>
            <div className="text-3xl font-bold mb-4">₹2,499<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
            <ul className="space-y-2 mb-6">
                {["Unlimited Projects", "Team Collaboration", "Advanced Analytics", "Priority Support"].map(item => (
                    <li key={item} className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-500 mr-2" /> {item}
                    </li>
                ))}
            </ul>
            <Button className="w-full" variant="outline">Manage Subscription</Button>
         </div>

         <div className="border rounded-xl p-6 bg-card">
            <h4 className="font-bold text-lg mb-4">Payment Method</h4>
            <div className="flex items-center space-x-4 mb-6">
               <div className="h-10 w-16 bg-slate-900 rounded flex items-center justify-center text-white font-bold text-xs">
                   VISA
               </div>
               <div>
                   <p className="font-medium text-sm">Visa ending in 4242</p>
                   <p className="text-xs text-muted-foreground">Expires 12/28</p>
               </div>
            </div>
            <Button variant="secondary" className="w-full">Update Payment Method</Button>
         </div>
      </div>
    </div>
  )
}
