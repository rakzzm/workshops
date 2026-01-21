"use client"

import { Badge } from "@/components/ui/badge"

const features = [
    { id: "sms", name: "SMS Notifications", desc: "Send SMS updates to customers.", active: true, beta: false },
    { id: "predictive", name: "Predictive Maintenance", desc: "AI-based service recommendations.", active: false, beta: true },
    { id: "loyalty", name: "Loyalty Program", desc: "Points system for returning customers.", active: false, beta: false },
    { id: "kiosk", name: "Kiosk Mode", desc: "Simplified interface for tablet check-ins.", active: true, beta: false },
]

export function FeatureSettings() {
  return (
    <div className="space-y-6">
       <div>
        <h3 className="text-lg font-medium">Features & Functions</h3>
        <p className="text-sm text-muted-foreground">
          Enable or disable modules to customize your workshop experience.
        </p>
      </div>

      <div className="grid gap-4">
        {features.map((feature) => (
             <div key={feature.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h4 className="font-medium">{feature.name}</h4>
                        {feature.beta && <Badge variant="outline" className="text-blue-500 border-blue-500">Beta</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={feature.active} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
             </div>
        ))}
      </div>
    </div>
  )
}
