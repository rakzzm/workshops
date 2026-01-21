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
import { createCustomer, updateCustomer } from "@/app/actions/customer-actions"

interface CustomerDialogProps {
  customer?: any
  trigger?: React.ReactNode
}

export function CustomerDialog({ customer, trigger }: CustomerDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const generateCustomerId = () => {
    const timestamp = Date.now().toString().slice(-4)
    return `CUST-${timestamp}`
  }

  const [formData, setFormData] = useState({
     customerId: customer?.customerId || generateCustomerId(),
     firstName: customer?.firstName || "",
     lastName: customer?.lastName || "",
     phone: customer?.phone || "",
     email: customer?.email || "",
     address: customer?.address || "",
     gstin: customer?.gstin || "",
     vehicles: [] as any[],
  })

  const [newVehicle, setNewVehicle] = useState({
    regNumber: "",
    model: "",
    type: "FOUR_WHEELER",
    chassisNumber: "",
    engineNumber: "",
  })

  useEffect(() => {
    if (customer && open) {
      setFormData({
        customerId: customer.customerId,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone || "",
        email: customer.email || "",
        address: customer.address || "",
        gstin: customer.gstin || "",
        vehicles: [],
      })
    }
  }, [customer, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
        let res
        if (customer) {
            res = await updateCustomer(customer.id, formData)
        } else {
            res = await createCustomer(formData)
        }

        if (res.success) {
            setOpen(false)
            if (!customer) {
                // Reset form if creating
                setFormData({
                  customerId: generateCustomerId(),
                  firstName: "",
                  lastName: "",
                  phone: "",
                  email: "",
                  address: "",
                  gstin: "",
                  vehicles: [],
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
                <Plus className="h-4 w-4 mr-2" /> Add Customer
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{customer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
          <DialogDescription>
            {customer ? "Update customer details below." : "Enter details for the new customer."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div>
            <Label htmlFor="customerId">Customer ID</Label>
            <Input 
              id="customerId" 
              value={formData.customerId} 
              onChange={(e) => setFormData({...formData, customerId: e.target.value})}
              required 
              disabled={!!customer}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                value={formData.firstName} 
                onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                required 
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                value={formData.lastName} 
                onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                required 
              />
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
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <textarea
              id="address" 
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.address} 
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, address: e.target.value})} 
              placeholder="Complete address..."
            />
          </div>

          <div>
            <Label htmlFor="gstin">GSTIN (Optional)</Label>
            <Input 
              id="gstin" 
              value={formData.gstin} 
              onChange={(e) => setFormData({...formData, gstin: e.target.value})} 
              placeholder="GST Identification Number"
            />
          </div>

          {/* Vehicle Section - Only show when creating new customer */}
          {!customer && (
            <div className="border-t pt-4">
              <Label className="text-base font-semibold">Vehicles (Optional)</Label>
              <p className="text-xs text-muted-foreground mb-3">Add vehicle(s) for this customer</p>
              
              {/* Added Vehicles List */}
              {formData.vehicles.length > 0 && (
                <div className="space-y-2 mb-3">
                  {formData.vehicles.map((vehicle: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                      <span>{vehicle.regNumber} - {vehicle.model} ({vehicle.type === 'TWO_WHEELER' ? '2W' : '4W'})</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const updated = [...formData.vehicles]
                          updated.splice(index, 1)
                          setFormData({...formData, vehicles: updated})
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Vehicle Form */}
              <div className="space-y-2 p-3 bg-gray-50 rounded">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="vehicleReg" className="text-xs">Reg Number</Label>
                    <Input
                      id="vehicleReg"
                      placeholder="KA-01-AB-1234"
                      value={newVehicle.regNumber}
                      onChange={(e) => setNewVehicle({...newVehicle, regNumber: e.target.value})}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vehicleModel" className="text-xs">Model</Label>
                    <Input
                      id="vehicleModel"
                      placeholder="Swift, Activa, etc."
                      value={newVehicle.model}
                      onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                      className="h-8"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="vehicleType" className="text-xs">Type</Label>
                    <select
                      id="vehicleType"
                      className="w-full h-8 text-xs border rounded-md px-2"
                      value={newVehicle.type}
                      onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value})}
                    >
                      <option value="FOUR_WHEELER">4-Wheeler</option>
                      <option value="TWO_WHEELER">2-Wheeler</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="vehicleChassis" className="text-xs">Chassis (Opt)</Label>
                    <Input
                      id="vehicleChassis"
                      placeholder="Chassis No."
                      value={newVehicle.chassisNumber}
                      onChange={(e) => setNewVehicle({...newVehicle, chassisNumber: e.target.value})}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vehicleEngine" className="text-xs">Engine (Opt)</Label>
                    <Input
                      id="vehicleEngine"
                      placeholder="Engine No."
                      value={newVehicle.engineNumber}
                      onChange={(e) => setNewVehicle({...newVehicle, engineNumber: e.target.value})}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    if (newVehicle.regNumber && newVehicle.model) {
                      setFormData({
                        ...formData,
                        vehicles: [...formData.vehicles, newVehicle]
                      })
                      setNewVehicle({
                        regNumber: "",
                        model: "",
                        type: "FOUR_WHEELER",
                        chassisNumber: "",
                        engineNumber: "",
                      })
                    } else {
                      alert("Please enter registration number and model")
                    }
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Vehicle
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Customer"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
