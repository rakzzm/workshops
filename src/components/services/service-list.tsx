"use client"

import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, FileText, User, Gauge, Fuel } from "lucide-react"
import { useState } from "react"
import { ServiceForm } from "./service-form"
import { deleteService } from "@/app/actions/service-actions"
import { useRouter } from "next/navigation"

interface ServiceListProps {
  services: any[]
  vehicles: any[]
  parts: any[]
  mechanics?: any[]
}

export function ServiceList({ services, vehicles, parts, mechanics = [] }: ServiceListProps) {
  const router = useRouter()
  const [editingService, setEditingService] = useState<any>(null)

  const handleDelete = async (id: number) => {
      if (confirm("Are you sure you want to delete this service record?")) {
          await deleteService(id)
          router.refresh()
      }
  }

  return (
    <div className="space-y-4">
      {services.map((service) => {
        const images = (service.images ? JSON.parse(service.images) : [])
          .filter((img: string) => img && img.trim() !== "" && !img.includes("1578844251758-2f71da645217"))
        const date = new Date(service.date).toLocaleDateString()
        
        return (
          <div key={service.id} className="border rounded-lg p-6 bg-card hover:shadow-md transition-shadow">
            <div className="flex flex-col gap-4">
               {/* Header Section */}
               <div className="flex justify-between items-start border-b pb-4">
                   <div className="space-y-1">
                       <div className="flex items-center gap-2">
                            <span className="font-bold text-xl">{service.vehicle.regNumber}</span>
                            <Badge variant="secondary">{service.vehicle.model}</Badge>
                            <Badge className={
                                service.status === "COMPLETED" ? "bg-green-600 hover:bg-green-600" : 
                                service.status === "IN_PROGRESS" ? "bg-blue-600 hover:bg-blue-600" : "bg-yellow-600 hover:bg-yellow-600"
                            }>{service.status}</Badge>
                       </div>
                       <div className="text-sm text-muted-foreground flex gap-4 mt-2">
                           {service.odometer && (
                               <div className="flex items-center gap-1"><Gauge className="h-3 w-3" /> {service.odometer} km</div>
                           )}
                           {service.fuelLevel && (
                               <div className="flex items-center gap-1"><Fuel className="h-3 w-3" /> {service.fuelLevel}</div>
                           )}
                           {service.serviceAdvisor && (
                               <div className="flex items-center gap-1"><User className="h-3 w-3" /> {service.serviceAdvisor}</div>
                           )}
                           <div>{service.serviceType || "Repair"}</div>
                       </div>
                   </div>
                   <div className="text-right">
                       <div className="text-sm font-medium text-muted-foreground">{date}</div>
                       <div className="text-2xl font-bold mt-1">₹{service.totalCost.toFixed(2)}</div>
                   </div>
               </div>

               {/* Content Section */}
               <div className="grid md:grid-cols-2 gap-6">
                   <div className="space-y-4">
                       <div>
                           <div className="text-sm font-semibold text-muted-foreground mb-1">Customer Complaint</div>
                           <p className="text-sm">{service.complaint}</p>
                       </div>
                       {service.mechanicNotes && (
                           <div className="bg-muted/30 p-3 rounded text-sm relative">
                               <FileText className="h-4 w-4 absolute top-3 left-3 text-muted-foreground" />
                               <div className="pl-6">
                                   <div className="font-medium mb-1">Observation/Notes</div>
                                   {service.mechanicNotes}
                               </div>
                           </div>
                       )}
                   </div>
                   
                   <div>
                       <div className="text-sm font-semibold text-muted-foreground mb-2">Service Items</div>
                       <div className="space-y-1">
                            {service.parts && service.parts.length > 0 ? (
                                <ul className="text-sm space-y-1">
                                    {service.parts.map((sp: any) => (
                                        <li key={sp.id} className="flex justify-between border-b border-dashed border-border/50 pb-1 last:border-0">
                                            <span>
                                                <Badge variant="outline" className="mr-2 text-[10px] h-4 px-1">
                                                    {sp.itemType === 'LABOR' ? 'L' : 'P'}
                                                </Badge>
                                                {sp.description || sp.part?.name} 
                                                <span className="text-muted-foreground ml-1">x{sp.quantity}</span>
                                            </span>
                                            <span className="font-mono text-xs">₹{sp.costAtTime.toFixed(2)}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : <span className="text-sm text-muted-foreground italic">No items recorded</span>}
                       </div>
                   </div>
               </div>
               
               {/* Footer with Images & Actions */}
               <div className="flex justify-between items-end pt-2">
                   <div className="flex gap-2">
                       {images.length > 0 && images.map((img: string, idx: number) => (
                           <div key={idx} className="h-16 w-16 rounded overflow-hidden border bg-muted relative">
                                <Image 
                                    src={img} 
                                    alt="Evidence" 
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                           </div>
                       ))}
                   </div>
                   
                   <div className="flex gap-2">
                       <Button variant="outline" size="sm" onClick={() => setEditingService(service)}>
                           <Pencil className="h-4 w-4 mr-2" /> Edit
                       </Button>
                       <Button variant="destructive" size="sm" onClick={() => handleDelete(service.id)}>
                           <Trash2 className="h-4 w-4" />
                       </Button>
                   </div>
               </div>
            </div>
          </div>
        )
      })}

      {editingService && (
          <ServiceForm 
            open={!!editingService} 
            onOpenChange={(open) => !open && setEditingService(null)}
            initialData={editingService}
            vehicles={vehicles}
            parts={parts}
            mechanics={mechanics}
            onClose={() => setEditingService(null)}
          />
      )}
    </div>
  )
}
