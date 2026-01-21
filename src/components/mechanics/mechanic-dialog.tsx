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
import { createMechanic, updateMechanic } from "@/app/actions/mechanic-actions"

interface MechanicDialogProps {
  mechanic?: any
  trigger?: React.ReactNode
}

export function MechanicDialog({ mechanic, trigger }: MechanicDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const generateEmployeeId = () => {
    const timestamp = Date.now().toString().slice(-4)
    return `EMP-${timestamp}`
  }

  const [formData, setFormData] = useState({
     employeeId: mechanic?.employeeId || generateEmployeeId(),
     name: mechanic?.name || "",
     email: mechanic?.email || "",
     phone: mechanic?.phone || "",
     specialization: mechanic?.specialization || "",
     department: mechanic?.department || "",
     yearsExperience: mechanic?.yearsExperience || 0,
     hourlyRate: mechanic?.hourlyRate || 150,
     performanceRating: mechanic?.performanceRating || 3.5,
     availability: mechanic?.availability || "AVAILABLE",
     shift: mechanic?.shift || "",
     status: mechanic?.status || "ACTIVE",
     emergencyContact: mechanic?.emergencyContact || "",
     notes: mechanic?.notes || ""
  })

  useEffect(() => {
    if (mechanic && open) {
      setFormData({
        employeeId: mechanic.employeeId,
        name: mechanic.name,
        email: mechanic.email || "",
        phone: mechanic.phone || "",
        specialization: mechanic.specialization || "",
        department: mechanic.department || "",
        yearsExperience: mechanic.yearsExperience || 0,
        hourlyRate: mechanic.hourlyRate || 150,
        performanceRating: mechanic.performanceRating || 3.5,
        availability: mechanic.availability || "AVAILABLE",
        shift: mechanic.shift || "",
        status: mechanic.status || "ACTIVE",
        emergencyContact: mechanic.emergencyContact || "",
        notes: mechanic.notes || ""
      })
    }
  }, [mechanic, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
        let res
        if (mechanic) {
            res = await updateMechanic(mechanic.id, formData)
        } else {
            res = await createMechanic(formData)
        }

        if (res.success) {
            setOpen(false)
            if (!mechanic) {
                // Reset form if creating
                setFormData({
                  employeeId: generateEmployeeId(),
                  name: "",
                  email: "",
                  phone: "",
                  specialization: "",
                  department: "",
                  yearsExperience: 0,
                  hourlyRate: 150,
                  performanceRating: 3.5,
                  availability: "AVAILABLE",
                  shift: "",
                  status: "ACTIVE",
                  emergencyContact: "",
                  notes: ""
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
                <Plus className="h-4 w-4 mr-2" /> Add Mechanic
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mechanic ? "Edit Mechanic" : "Add New Mechanic"}</DialogTitle>
          <DialogDescription>
            {mechanic ? "Update mechanic details below." : "Enter details for the new mechanic."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input 
                id="employeeId" 
                value={formData.employeeId} 
                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                required 
                disabled={!!mechanic}
              />
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="specialization">Specialization</Label>
              <Input 
                id="specialization" 
                value={formData.specialization} 
                onChange={(e) => setFormData({...formData, specialization: e.target.value})} 
                placeholder="e.g. Engine Specialist" 
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <select 
                id="department"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              >
                <option value="">-- Select Department --</option>
                <option value="Engine">Engine</option>
                <option value="Electrical">Electrical</option>
                <option value="Transmission">Transmission</option>
                <option value="Chassis">Chassis (Brakes & Suspension)</option>
                <option value="Body Shop">Body Shop</option>
                <option value="Diagnostics">Diagnostics</option>
                <option value="HVAC">HVAC (AC & Cooling)</option>
                <option value="2W Service">2W Service</option>
                <option value="Service">General Service</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="experience">Years Experience</Label>
              <Input 
                id="experience" 
                type="number"
                min="0"
                value={formData.yearsExperience} 
                onChange={(e) => setFormData({...formData, yearsExperience: parseInt(e.target.value) || 0})} 
              />
            </div>
            <div>
              <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
              <Input 
                id="hourlyRate" 
                type="number"
                min="0"
                step="10"
                value={formData.hourlyRate} 
                onChange={(e) => setFormData({...formData, hourlyRate: parseFloat(e.target.value) || 0})} 
              />
            </div>
            <div>
              <Label htmlFor="rating">Rating (1-5)</Label>
              <Input 
                id="rating" 
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={formData.performanceRating} 
                onChange={(e) => setFormData({...formData, performanceRating: parseFloat(e.target.value) || 3.5})} 
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="availability">Availability</Label>
              <select 
                id="availability"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.availability}
                onChange={(e) => setFormData({...formData, availability: e.target.value})}
              >
                <option value="AVAILABLE">Available</option>
                <option value="BUSY">Busy</option>
                <option value="ON_LEAVE">On Leave</option>
              </select>
            </div>
            <div>
              <Label htmlFor="shift">Shift</Label>
              <select 
                id="shift"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.shift}
                onChange={(e) => setFormData({...formData, shift: e.target.value})}
              >
                <option value="">-- Select Shift --</option>
                <option value="MORNING">Morning</option>
                <option value="AFTERNOON">Afternoon</option>
                <option value="NIGHT">Night</option>
                <option value="FLEXIBLE">Flexible</option>
              </select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select 
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="emergency">Emergency Contact</Label>
            <Input 
              id="emergency" 
              value={formData.emergencyContact} 
              onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})} 
              placeholder="Name - Phone"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <textarea 
              id="notes" 
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.notes} 
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, notes: e.target.value})} 
              placeholder="Internal notes about this mechanic..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Mechanic"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
