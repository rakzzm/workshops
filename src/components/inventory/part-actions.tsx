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
import { MoreHorizontal, Edit, Trash2, Loader2 } from "lucide-react"
import { PartDialog } from "./part-dialog"
import { deletePart } from "@/app/actions/inventory-actions"
import { useRouter } from "next/navigation"

interface PartActionsProps {
  part: any
}

export function PartActions({ part }: PartActionsProps) {
  const [showEdit, setShowEdit] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
      if (!confirm("Are you sure you want to delete this part?")) return
      
      setLoading(true)
      try {
          const res = await deletePart(part.id)
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
            <DropdownMenuItem onClick={() => setShowEdit(true)}>
                <Edit className="mr-2 h-4 w-4" /> Edit Part
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Part
            </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>

        <PartDialog 
            mode="edit" 
            part={part} 
            open={showEdit} 
            onOpenChange={setShowEdit} 
        />
    </>
  )
}
