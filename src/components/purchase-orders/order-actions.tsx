"use client"

import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Trash2, Loader2 } from "lucide-react"
import { OrderDetailsDialog } from "./order-details-dialog"
import { deleteOrder } from "@/app/actions/orders"
import { useRouter } from "next/navigation"

interface OrderActionsProps {
  order: any
}

export function OrderActions({ order }: OrderActionsProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
      if (!confirm("Are you sure you want to delete this order?")) return
      
      setLoading(true)
      try {
          const res = await deleteOrder(order.id)
          if (res.success) {
              router.refresh()
          } else {
              alert(res.error)
          }
      } catch (e) {
          alert("Failed to delete")
      } finally {
          setLoading(false)
      }
  }

  return (
    <>
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setShowDetails(true)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Order
            </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>

        <OrderDetailsDialog 
            order={order} 
            open={showDetails} 
            onOpenChange={setShowDetails} 
        />
    </>
  )
}
