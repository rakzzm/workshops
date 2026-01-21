"use client"

import { useState, useEffect } from "react"
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
import { createPart, updatePart } from "@/app/actions/inventory-actions"
import { Plus, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface PartDialogProps {
  mode?: "create" | "edit"
  part?: any
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function PartDialog({ mode = "create", part, trigger, open: controlledOpen, onOpenChange: setControlledOpen }: PartDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Manage open state internally if not controlled, or sync if controlled
  const isOpen = controlledOpen !== undefined ? controlledOpen : open
  const onOpenChange = setControlledOpen || setOpen

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    stock: "",
    minStockLevel: "5",
    imageUrl: ""
  })

  // Load part data when editing
  useEffect(() => {
    if (mode === "edit" && part) {
        setFormData({
            name: part.name,
            sku: part.sku,
            category: part.category,
            price: part.price.toString(),
            stock: part.stock.toString(),
            minStockLevel: part.minStockLevel.toString(),
            imageUrl: part.imageUrl || ""
        })
    } else if (!open) {
        // Reset on close if create mode
        setFormData({
            name: "",
            sku: "",
            category: "",
            price: "",
            stock: "",
            minStockLevel: "5",
            imageUrl: ""
        })
    }
  }, [mode, part, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
        let result
        if (mode === "edit" && part) {
            result = await updatePart(part.id, formData)
        } else {
            result = await createPart(formData)
        }

        if (result.success) {
            onOpenChange(false)
            router.refresh()
        } else {
            alert(result.error)
        }
    } catch (e) {
        alert("Something went wrong")
    } finally {
        setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
            <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Part
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add New Part" : "Edit Part"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Add a new item to your inventory here." : "Make changes to the part details here."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                Name
                </Label>
                <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="col-span-3"
                    required
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sku" className="text-right">
                SKU
                </Label>
                <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    className="col-span-3"
                    required
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                Category
                </Label>
                <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="col-span-3"
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                Price (₹)
                </Label>
                <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="col-span-3"
                    required
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock" className="text-right">
                Stock
                </Label>
                <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="col-span-3"
                    required
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="minStock" className="text-right">
                Min Stock
                </Label>
                <Input
                    id="minStock"
                    type="number"
                    value={formData.minStockLevel}
                    onChange={(e) => setFormData({...formData, minStockLevel: e.target.value})}
                    className="col-span-3"
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imageUrl" className="text-right">
                Image URL
                </Label>
                <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    className="col-span-3"
                    placeholder="https://example.com/image.jpg"
                />
            </div>
            </div>
            <DialogFooter>
            <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "create" ? "Create Part" : "Save Changes"}
            </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
