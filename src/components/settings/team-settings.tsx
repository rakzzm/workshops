"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, MoreHorizontal } from "lucide-react"

const members = [
  { name: "John Doe", email: "john@autofix.com", role: "Admin", initials: "JD" },
  { name: "Jane Smith", email: "jane@autofix.com", role: "Mechanic", initials: "JS" },
]

export function TeamSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h3 className="text-lg font-medium">Team Members</h3>
            <p className="text-sm text-muted-foreground">
            Manage who has access to your workspace.
            </p>
        </div>
        <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Invite Member</Button>
      </div>
      
      <div className="border rounded-md divide-y">
        {members.map((member) => (
            <div key={member.email} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <Avatar>
                        <AvatarFallback>{member.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs bg-secondary px-2 py-1 rounded text-secondary-foreground">
                        {member.role}
                    </span>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        ))}
      </div>
    </div>
  )
}
