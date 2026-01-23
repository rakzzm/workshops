import { Input } from "@/components/ui/input"
export const dynamic = 'force-dynamic'
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import prisma from "@/lib/prisma"
import { MOCK_SERVICE_RECORDS, MOCK_MECHANICS, MOCK_VEHICLES, MOCK_PARTS, MOCK_VENDORS } from "@/lib/mock-data"
import { ServiceForm } from "@/components/services/service-form"
import { ServiceList } from "@/components/services/service-list"

export default async function ServicesPage(props: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams
  const query = searchParams.q
  
  // Build query
  const where: any = {}
if (query) {
      where.OR = [
          { vehicle: { regNumber: { contains: query } } },
          { vehicle: { ownerName: { contains: query } } },
          { vehicle: { model: { contains: query } } }
      ]
  }

  let services: any[] = []
  let mechanics: any[] = []
  let vehicles: any[] = []
  let parts: any[] = []
  let vendors: any[] = []

  try {
    services = await prisma.serviceRecord.findMany({
        where,
        orderBy: { date: 'desc' },
        include: {
            vehicle: true,
            parts: {
                include: { part: true }
            }
        }
    })
  } catch (error) {
    console.log('Database unavailable, using mock services')
    services = MOCK_SERVICE_RECORDS
  }

  try {
    mechanics = await prisma.mechanic.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { name: 'asc' }
    })
  } catch (error) {
    console.log('Database unavailable, using mock mechanics')
    mechanics = MOCK_MECHANICS
  }

  try {
    vehicles = await prisma.vehicle.findMany({
        orderBy: { updatedAt: 'desc' }
    })
  } catch (error) {
    console.log('Database unavailable, using mock vehicles')
    vehicles = MOCK_VEHICLES
  }

  try {
    parts = await prisma.part.findMany({
        orderBy: { name: 'asc' }
    })
  } catch (error) {
    console.log('Database unavailable, using mock parts')
    parts = MOCK_PARTS
  }

  try {
    vendors = await prisma.vendor.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { companyName: 'asc' }
    })
  } catch (error) {
    console.log('Database unavailable, using mock vendors')
    vendors = MOCK_VENDORS
  }

  return (
      <div className="space-y-6">
          <div className="flex justify-between items-center">
              <div>
                  <h1 className="text-3xl font-bold tracking-tight">Service Management</h1>
                  <p className="text-muted-foreground">Track and manage all service records.</p>
              </div>
              <ServiceForm mechanics={mechanics} vehicles={vehicles} parts={parts} vendors={vendors} />
          </div>

          <ServiceList services={services} />
      </div>
  )
}
