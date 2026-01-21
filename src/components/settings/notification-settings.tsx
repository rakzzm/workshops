"use client"

import { Label } from "@/components/ui/label"

// Simple switch implementation if component is missing (likely missing based on previous steps)
function SimpleSwitch({ id, defaultChecked, disabled }: { id: string, defaultChecked?: boolean, disabled?: boolean }) {
    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id={id} className="sr-only peer" defaultChecked={defaultChecked} disabled={disabled} />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
    )
}

export function NotificationSettings() {
  return (
    <div className="space-y-6">
       <div>
        <h3 className="text-lg font-medium">Notifications</h3>
        <p className="text-sm text-muted-foreground">
          Configure how you receive alerts and emails.
        </p>
      </div>
      
      <div className="space-y-4">
        {[
            { id: "email-orders", label: "Email me when a new order is received", desc: "Get notified immediately for every new order." },
            { id: "email-stock", label: "Low stock alerts", desc: "Receive valid low stock alerts via email." },
            { id: "sms-urgent", label: "SMS for urgent issues", desc: "Get text messages for critical system failures." },
            { id: "marketing", label: "Marketing emails", desc: "Receive news and updates about features." },
        ].map(item => (
            <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                <div className="space-y-0.5">
                    <Label htmlFor={item.id} className="text-base">{item.label}</Label>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                <SimpleSwitch id={item.id} defaultChecked />
            </div>
        ))}
      </div>
    </div>
  )
}
