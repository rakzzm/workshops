"use client"

import { Button } from "@/components/ui/button"
import { Download, RotateCcw, Upload } from "lucide-react"

export function BackupSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Backup & Restore</h3>
        <p className="text-sm text-muted-foreground">
          Manage your data safety. Download snapshots or restore from a previous point.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="border rounded-lg p-6 bg-card">
            <h4 className="font-medium mb-4 flex items-center gap-2">
                <Download className="h-5 w-5" /> Manual Backup
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
                Create an immediate snapshot of your entire database (Inventory, Orders, Customers).
            </p>
            <Button>Download Backup (.sql)</Button>
        </div>

        <div className="border rounded-lg p-6 bg-card">
             <h4 className="font-medium mb-4 flex items-center gap-2">
                <Upload className="h-5 w-5" /> Restore Data
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
                Restore your system from a backup file. 
                <span className="text-red-500 font-medium ml-1">Warning: This will overwrite current data.</span>
            </p>
            <Button variant="outline">Select Backup File</Button>
        </div>

        <div className="border rounded-lg p-6 bg-card">
             <h4 className="font-medium mb-4 flex items-center gap-2">
                <RotateCcw className="h-5 w-5" /> Auto-Backup Schedule
            </h4>
            <div className="flex items-center gap-4">
                 <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                     <option>Daily at 12:00 AM</option>
                     <option>Weekly (Sundays)</option>
                     <option>Monthly</option>
                     <option>Never</option>
                 </select>
                 <Button variant="secondary">Save Schedule</Button>
            </div>
        </div>
      </div>
    </div>
  )
}
