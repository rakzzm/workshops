import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { ServiceForm } from "@/components/services/service-form"
import { ServiceList } from "@/components/services/service-list"

export default async function ServicesPage(props: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams
  const query = searchParams.q
  
  // Fetch data for the form
  const vehiclesList = await prisma.vehicle.findMany({ 
      select: { 
          id: true, 
          regNumber: true, 
          model: true, 
          ownerName: true,
          ownerPhone: true,
          ownerAddress: true,
          ownerGstin: true,
          chassisNumber: true,
          engineNumber: true
      } 
  })
  const partsList = await prisma.part.findMany({ select: { id: true, name: true, price: true } })

  // Build query
  const where: any = {}
  if (query) {
      where.OR = [
          { vehicle: { regNumber: { contains: query } } },
          { vehicle: { ownerName: { contains: query } } },
          { vehicle: { model: { contains: query } } }
      ]
  }

  const services = await prisma.serviceRecord.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
          vehicle: true,
          parts: {
              include: { part: true }
          }
      }
  })

  // Fetch Mechanics
  const mechanics = await prisma.mechanic.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' }
  })

  // Fetch Vehicles for the form
  const vehicles = await prisma.vehicle.findMany({
      orderBy: { updatedAt: 'desc' }
  })
  
  // Fetch Parts for the form
  const parts = await prisma.part.findMany({
      orderBy: { name: 'asc' }
  })
  
  // Fetch Vendors
  const vendors = await prisma.vendor.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { companyName: 'asc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service History</h1>
          <p className="text-muted-foreground">Manage service records and job cards.</p>
        </div>
        <ServiceForm vehicles={vehicles} parts={parts} mechanics={mechanics} vendors={vendors} />
      </div>
       
       <form className="flex gap-4">
          <div className="relative flex-1">
             <Search className="absolute left-3 top-4 h-5 w-5 text-muted-foreground" />
             <Input 
                name="q" 
                placeholder="Search by Vehicle Registration..." 
                defaultValue={query} 
                className="h-14 pl-10 text-lg bg-card/50"
             />
          </div>
          <Button type="submit" size="lg" className="h-14 px-8">Search</Button>
       </form>

       <div className="space-y-6">
           {services.length === 0 ? (
               <div className="p-12 text-center border border-dashed rounded-lg bg-muted/20">
                    <p className="text-muted-foreground">No service records found.</p>
                    {query && <p className="text-sm text-muted-foreground mt-2">Try searching for a different vehicle.</p>}
               </div>
           ) : (
               <div className="space-y-4">
                   <h2 className="text-xl font-semibold">{query ? `Results for "${query}"` : "Recent Services"}</h2>
                   <ServiceList services={services} vehicles={vehicles} parts={parts} mechanics={mechanics} />
               </div>
           )}
       </div>
    </div>
  )
}
