"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { createVendor, updateVendor } from "@/app/actions/vendor-actions"

interface VendorDialogProps {
  vendor?: any
  trigger?: React.ReactNode
}

export function VendorDialog({ vendor, trigger }: VendorDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const generateVendorId = () => {
    const timestamp = Date.now().toString().slice(-4)
    return `VND-${timestamp}`
  }

  const [formData, setFormData] = useState({
    vendorId: vendor?. vendorId || generateVendorId(),
    companyName: vendor?.companyName || "",
    contactPerson: vendor?.contactPerson || "",
    phone: vendor?.phone || "",
    email: vendor?.email || "",
    address: vendor?.address || "",
    city: vendor?.city || "",
    state: vendor?.state || "",
    pincode: vendor?.pincode || "",
    gstin: vendor?.gstin || "",
    pan: vendor?.pan || "",
    category: vendor?.category || "General",
    paymentTerms: vendor?.paymentTerms || "NET30",
    creditLimit: vendor?.creditLimit || "",
    rating: vendor?.rating || 3.0,
    status: vendor?.status || "ACTIVE",
    notes: vendor?.notes || "",
  })

  useEffect(() => {
    if (vendor && open) {
      setFormData({
        vendorId: vendor.vendorId,
        companyName: vendor.companyName,
        contactPerson: vendor.contactPerson || "",
        phone: vendor.phone,
        email: vendor.email || "",
        address: vendor.address || "",
        city: vendor.city || "",
        state: vendor.state || "",
        pincode: vendor.pincode || "",
        gstin: vendor.gstin || "",
        pan: vendor.pan || "",
        category: vendor.category || "General",
        paymentTerms: vendor.paymentTerms || "NET30",
        creditLimit: vendor.creditLimit || "",
        rating: vendor.rating || 3.0,
        status: vendor.status || "ACTIVE",
        notes: vendor.notes || "",
      })
    }
  }, [vendor, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit as string) : null,
        rating: parseFloat(formData.rating as any),
      }
      
      let res
      if (vendor) {
        res = await updateVendor(vendor.id, submitData)
      } else {
        res = await createVendor(submitData)
      }

      if (res.success) {
        setOpen(false)
        if (!vendor) {
          setFormData({
            vendorId: generateVendorId(),
            companyName: "",
            contactPerson: "",
            phone: "",
            email: "",
            address: "",
            city: "",
            state: "",
            pincode: "",
            gstin: "",
            pan: "",
            category: "General",
            paymentTerms: "NET30",
            creditLimit: "",
            rating: 3.0,
            status: "ACTIVE",
            notes: "",
          })
        }
      } else {
        alert(res.error)
      }
    } catch (error) {
      console.error(error)
      alert("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Add Vendor
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vendor ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
          <DialogDescription>
            {vendor ? "Update vendor details below." : "Enter details for the new vendor."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vendorId">Vendor ID</Label>
              <Input 
                id="vendorId" 
                value={formData.vendorId} 
                onChange={(e) => setFormData({...formData, vendorId: e.target.value})}
                required 
                disabled={!!vendor}
              />
            </div>
            <div>
              <Label htmlFor="companyName">Company Name *</Label>
              <Input 
                id="companyName" 
                value={formData.companyName} 
                onChange={(e) => setFormData({...formData, companyName: e.target.value})} 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input 
                id="contactPerson" 
                value={formData.contactPerson} 
                onChange={(e) => setFormData({...formData, contactPerson: e.target.value})} 
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input 
                id="phone" 
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                required 
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email"
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
            />
          </div>

          {/* Address */}
          <div className="border-t pt-3">
            <Label className="text-sm font-semibold">Address Details</Label>
            <div className="grid gap-3 mt-2">
              <Input 
                placeholder="Address" 
                value={formData.address} 
                onChange={(e) => setFormData({...formData, address: e.target.value})} 
              />
              <div className="grid grid-cols-3 gap-2">
                <Input 
                  placeholder="City" 
                  value={formData.city} 
                  onChange={(e) => setFormData({...formData, city: e.target.value})} 
                />
                <Input 
                  placeholder="State" 
                  value={formData.state} 
                  onChange={(e) => setFormData({...formData, state: e.target.value})} 
                />
                <Input 
                  placeholder="Pincode" 
                  value={formData.pincode} 
                  onChange={(e) => setFormData({...formData, pincode: e.target.value})} 
                />
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="border-t pt-3">
            <Label className="text-sm font-semibold">Business Details</Label>
            <div className="grid gap-3 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="gstin" className="text-xs">GSTIN</Label>
                  <Input 
                    id="gstin" 
                    value={formData.gstin} 
                    onChange={(e) => setFormData({...formData, gstin: e.target.value})} 
                    placeholder="GST Number"
                  />
                </div>
                <div>
                  <Label htmlFor="pan" className="text-xs">PAN</Label>
                  <Input 
                    id="pan" 
                    value={formData.pan} 
                    onChange={(e) => setFormData({...formData, pan: e.target.value})} 
                    placeholder="PAN Number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="category" className="text-xs">Category</Label>
                  <select
                    id="category"
                    className="w-full h-9 text-sm border rounded-md px-2"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Parts">Parts</option>
                    <option value="Tools">Tools & Equipment</option>
                    <option value="Consumables">Consumables</option>
                    <option value="Services">Services</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="paymentTerms" className="text-xs">Payment Terms</Label>
                  <select
                    id="paymentTerms"
                    className="w-full h-9 text-sm border rounded-md px-2"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})}
                  >
                    <option value="COD">Cash on Delivery</option>
                    <option value="NET15">NET 15</option>
                    <option value="NET30">NET 30</option>
                    <option value="NET60">NET 60</option>
                    <option value="Advance">Advance Payment</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="creditLimit" className="text-xs">Credit Limit (₹)</Label>
                  <Input 
                    id="creditLimit" 
                    type="number"
                    value={formData.creditLimit} 
                    onChange={(e) => setFormData({...formData, creditLimit: e.target.value})} 
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="rating" className="text-xs">Rating (1-5)</Label>
                  <Input 
                    id="rating" 
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.rating} 
                    onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})} 
                  />
                </div>
                <div>
                  <Label htmlFor="status" className="text-xs">Status</Label>
                  <select
                    id="status"
                    className="w-full h-9 text-sm border rounded-md px-2"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="BLOCKED">Blocked</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes" 
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.notes} 
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, notes: e.target.value})} 
              placeholder="Additional notes or comments..."
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Vendor"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
