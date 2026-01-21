"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const integrations = [
  { name: "Slack", description: "Receive notifications in your Slack channels.", connected: false },
  { name: "WhatsApp", description: "Send automated updates to customers via WhatsApp.", connected: true },
  { name: "QuickBooks", description: "Sync your invoices and purchase orders.", connected: false },
  { name: "Google Calendar", description: "Sync service appointments.", connected: false },
]

export function IntegrationSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Integrations</h3>
        <p className="text-sm text-muted-foreground">
          Connect your workshop with your favorite tools.
        </p>
      </div>
      <div className="grid gap-4">
        {integrations.map((item) => (
            <div key={item.name} className="flex items-center justify-between p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                         <h4 className="font-semibold">{item.name}</h4>
                         {item.connected && <Badge variant="secondary" className="text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300">Connected</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <Button variant={item.connected ? "outline" : "default"}>
                    {item.connected ? "Configure" : "Connect"}
                </Button>
            </div>
        ))}
      </div>
    </div>
  )
}
