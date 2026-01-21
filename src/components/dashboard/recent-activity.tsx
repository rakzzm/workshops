"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function RecentActivity({ services, orders }: { services: any[], orders: any[] }) {
  
  // Combine and sort activities (basic mock sort for now, ideally combine and sort by date)
  const activities = [
      ...services.map(s => ({ type: 'service', date: new Date(s.updatedAt), data: s })),
      ...orders.map(o => ({ type: 'order', date: new Date(o.date), data: o }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5)

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest workshop updates.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
          ) : activities.map((item, i) => (
             <div key={i} className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className={item.type === 'service' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}>
                      {item.type === 'service' ? "S" : "O"}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {item.type === 'service' 
                        ? `Service completed for ${item.data.vehicle?.regNumber || 'Vehicle'}`
                        : `Order #${item.data.id} placed`
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.type === 'service' 
                        ? `₹${item.data.totalCost.toFixed(2)}`
                        : `${item.data.status}`
                    }
                  </p>
                </div>
                <div className="ml-auto font-medium text-xs text-muted-foreground">
                    {item.date.toLocaleDateString()}
                </div>
             </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
