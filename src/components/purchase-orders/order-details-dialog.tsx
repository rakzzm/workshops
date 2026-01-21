"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { updateOrderStatus } from "@/app/actions/orders"
import { Loader2, CheckCircle2 } from "lucide-react"

interface OrderDetailsDialogProps {
  order: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrderDetailsDialog({ order, open, onOpenChange }: OrderDetailsDialogProps) {
  const [loading, setLoading] = useState(false)
  
  if (!order) return null

  const items = order.items ? JSON.parse(order.items) : []
  const isReceived = order.status === "RECEIVED"

  const handleReceiveOrder = async () => {
    if (!confirm("Are you sure you want to mark this order as Received? This will update your inventory stock.")) return

    setLoading(true)
    try {
        const res = await updateOrderStatus(order.id, "RECEIVED")
        if (res.success) {
            onOpenChange(false)
        } else {
            alert(res.error)
        }
    } catch (e) {
        alert("Failed to update status")
    } finally {
        setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <div className="flex justify-between items-start pr-8">
            <div>
                <DialogTitle>Order #{order.id}</DialogTitle>
                <DialogDescription>
                    Placed on {new Date(order.date).toLocaleDateString()}
                </DialogDescription>
            </div>
            <Badge variant={isReceived ? "default" : "secondary"}>
                {order.status}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="border rounded-md mt-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Part Name</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item: any, i: number) => (
                        <TableRow key={i}>
                            <TableCell>{item.partName || "Unknown Part"}</TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">{item.partId}</TableCell>
                            <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                        </TableRow>
                    ))}
                    {items.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                                No items in this order.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>

        <div className="flex justify-end gap-2 mt-4">
            {!isReceived && (
                <Button onClick={handleReceiveOrder} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CheckCircle2 className="mr-2 h-4 w-4"/>}
                    Receive Order (Update Stock)
                </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
