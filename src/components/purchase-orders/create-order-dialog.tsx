"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"
import { createPurchaseOrder } from "@/app/actions/orders"

type Part = {
  id: number
  name: string
  sku: string
}

export function CreateOrderDialog({ parts }: { parts: Part[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Local state for items being added to the order
  const [orderItems, setOrderItems] = useState<{partId: string, quantity: number}[]>([])
  
  const handleAddItem = () => {
    setOrderItems([...orderItems, { partId: "", quantity: 1 }])
  }

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  const handleUpdateItem = (index: number, field: 'partId' | 'quantity', value: string | number) => {
    const newItems = [...orderItems]
    // @ts-ignore
    newItems[index][field] = value
    setOrderItems(newItems)
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    
    const itemsToSave = orderItems.map(item => {
      const part = parts.find(p => p.id.toString() === item.partId)
      return {
        partId: item.partId,
        partName: part?.name || "Unknown Part",
        quantity: item.quantity
      }
    })

    formData.set("items", JSON.stringify(itemsToSave))

    try {
      await createPurchaseOrder(formData)
      setOpen(false)
      setOrderItems([])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" /> New Order</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
          <DialogDescription>
            Create a new purchase order for parts.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="supplier">Supplier Name</Label>
            <Input id="supplier" name="supplier" required placeholder="e.g. Acme Auto Parts" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
                <Label>Order Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                    <Plus className="h-3 w-3 mr-1"/> Add Item
                </Button>
            </div>
            
            {orderItems.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">
                    No items added yet.
                </div>
            )}

            <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {orderItems.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center">
                        <select 
                            className="flex h-9 flex-1 items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={item.partId} 
                            onChange={(e) => handleUpdateItem(index, 'partId', e.target.value)}
                        >
                            <option value="" disabled>Select Part</option>
                            {parts.map(part => (
                                <option key={part.id} value={part.id.toString()}>
                                    {part.name} ({part.sku})
                                </option>
                            ))}
                        </select>
                        <Input 
                            type="number" 
                            min="1" 
                            className="w-20" 
                            value={item.quantity} 
                            onChange={(e) => handleUpdateItem(index, 'quantity', parseInt(e.target.value))}
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                            <Trash2 className="h-4 w-4 text-destructive"/>
                        </Button>
                    </div>
                ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
