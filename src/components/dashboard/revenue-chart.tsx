"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function RevenueChart({ data }: { data: any[] }) {
  return (
    <Card className="col-span-2 md:col-span-2">
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Income from completed services over the last 7 days.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
                <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                />
                <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                    formatter={(value: any) => [`₹${value}`, "Revenue"]}
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{borderRadius: '8px', border: 'none', backgroundColor: 'hsl(var(--popover))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar
                    dataKey="total"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
            </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
