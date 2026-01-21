import { Badge } from "@/components/ui/badge"
import { Clock, AlertTriangle, AlertOctagon } from "lucide-react"

interface SLABadgeProps {
  dueDate: Date
  status: string // OPEN, RESOLVED, etc.
}

export function SLABadge({ dueDate, status }: SLABadgeProps) {
  if (status === 'RESOLVED') {
    return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Resolved</Badge>
  }

  const now = new Date()
  const diffInHours = (new Date(dueDate).getTime() - now.getTime()) / (1000 * 60 * 60)

  // Breached
  if (diffInHours < 0) {
    return (
      <Badge variant="destructive" className="animate-pulse flex items-center gap-1 font-bold">
        <AlertOctagon className="h-3 w-3" />
        BREACHED
      </Badge>
    )
  }

  // Risk (< 2 hours)
  if (diffInHours < 2) {
    return (
      <Badge className="bg-amber-500 hover:bg-amber-600 flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        {Math.ceil(diffInHours)}h Left
      </Badge>
    )
  }

  // Safe
  return (
    <Badge variant="secondary" className="flex items-center gap-1">
      <Clock className="h-3 w-3" />
      {Math.ceil(diffInHours)}h Left
    </Badge>
  )
}
