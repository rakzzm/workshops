import prisma from "@/lib/prisma"
import { MOCK_CUSTOMERS } from "@/lib/mock-data"
export const dynamic = 'force-dynamic'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Car, Wrench, TrendingUp, Edit2, Trash2, Phone, Mail, MapPin } from "lucide-react"
import { CustomerDialog } from "@/components/customers/customer-dialog"
import { deleteCustomer } from "@/app/actions/customer-actions"

export default async function CustomersPage() {
  let customers: any[] = []
  
  try {
    customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        vehicles: {
          include: {
            serviceRecords: true
          }
        }
      }
    })
  } catch (error) {
    console.error('Database error, using mock data:', error)
    customers = MOCK_CUSTOMERS as any[]
  }

  // Calculate stats
  const totalCustomers = customers.length
  const totalVehicles = customers.reduce((acc: number, c: any) => acc + c.vehicles.length, 0)
  const totalServices = customers.reduce((acc: number, c: any) => 
    acc + c.vehicles.reduce((sum: number, v: any) => sum + v.serviceRecords.length, 0), 0)
  
  // Calculate average spend (total cost from all service records)
  const totalSpend = customers.reduce((acc: number, c: any) =>
    acc + c.vehicles.reduce((sum: number, v: any) =>
      sum + v.serviceRecords.reduce((svcSum: number, svc: any) => svcSum + (svc.cost || svc.totalCost || 0), 0), 0), 0)
  const avgSpend = customers.length > 0 ? totalSpend / customers.length : 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
          <p className="text-muted-foreground">Manage your customer database and relationships.</p>
        </div>
        <CustomerDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
               <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold">{totalCustomers}</div>
               <p className="text-xs text-muted-foreground">Registered in system</p>
            </CardContent>
         </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Active Vehicles</CardTitle>
               <Car className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold">{totalVehicles}</div>
               <p className="text-xs text-muted-foreground">Across all customers</p>
            </CardContent>
         </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Total Services</CardTitle>
               <Wrench className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold">{totalServices}</div>
               <p className="text-xs text-muted-foreground">Service records</p>
            </CardContent>
         </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Avg Customer Value</CardTitle>
               <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold">₹{avgSpend.toFixed(0)}</div>
               <p className="text-xs text-muted-foreground">Average spend</p>
            </CardContent>
         </Card>
      </div>

      {/* Customers Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {customers.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              No customers found. Add your first customer!
            </CardContent>
          </Card>
        ) : customers.map(customer => {
          const vehicleCount = customer.vehicles.length
          // @ts-expect-error - Mock data interface compatibility
          const serviceCount = customer.vehicles.reduce((sum, v) => sum + v.serviceRecords.length, 0)
          const lastService = customer.vehicles
          // @ts-expect-error - Mock data interface compatibility
            .flatMap(v => v.serviceRecords)
          
          // Get common issues from service records
          const complaints = customer.vehicles
            .flatMap((v: any) => v.serviceRecords)
            .map((s: any) => s.complaint)
            .filter(Boolean)
          const commonIssues = complaints.length > 0 
            ? complaints.slice(0, 2).join(", ")
            : "No service history"
          
          return (
            <Card key={customer.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{customer.firstName} {customer.lastName}</CardTitle>
                    </div>
                    <p className="text-xs text-muted-foreground">{customer.customerId}</p>
                  </div>
                  <div className="flex gap-1">
                    <CustomerDialog customer={customer} trigger={<Button variant="ghost" size="icon" className="h-7 w-7"><Edit2 className="h-3 w-3" /></Button>} />
                    <form action={async () => {
                        "use server"
                        await deleteCustomer(customer.id)
                    }}>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3 w-3" /></Button>
                    </form>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Contact Info  */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span>{customer.phone}</span>
                  </div>
                  {customer.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3 w-3 text-muted-foreground mt-0.5" />
                      <span className="text-xs line-clamp-2">{customer.address}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Vehicles</div>
                    <div className="text-sm font-bold">{vehicleCount}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Services</div>
                    <div className="text-sm font-bold">{serviceCount}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Last Visit</div>
                    <div className="text-xs font-bold">
                      {lastService ? new Date(lastService.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Never'}
                    </div>
                  </div>
                </div>

                {/* Common Issues */}
                {serviceCount > 0 && (
                  <div className="space-y-1 pt-2 border-t">
                    <div className="text-xs font-medium">Recent Issues</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{commonIssues}</div>
                  </div>
                )}

                {/* GSTIN if present */}
                {customer.gstin && (
                  <div className="pt-2 border-t">
                    <Badge variant="outline" className="text-xs">GST: {customer.gstin}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
