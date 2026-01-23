import prisma from "@/lib/prisma"
import { MOCK_VENDORS } from "@/lib/mock-data"
export const dynamic = 'force-dynamic'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, TrendingUp, Star, Phone, Mail, MapPin, Edit2, Trash2 } from "lucide-react"
import { VendorDialog } from "@/components/vendors/vendor-dialog"
import { deleteVendor } from "@/app/actions/vendor-actions"

export default async function VendorsPage() {
  let vendors: any[] = []
  
  try {
    vendors = await prisma.vendor.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        purchaseOrders: true
      }
    })
  } catch (error) {
    console.error('Database error, using mock data:', error)
    vendors = MOCK_VENDORS as any[]
  }

  const totalVendors = vendors.length
  const activeVendors = vendors.filter(v => v.status === 'ACTIVE').length
  const totalPurchaseValue = vendors.reduce((acc, v) => acc + v.totalPurchases, 0)
  const avgRating = vendors.length > 0 ? vendors.reduce((acc, v) => acc + v.rating, 0) / vendors.length : 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendor Management</h1>
          <p className="text-muted-foreground">Manage suppliers and track procurement relationships.</p>
        </div>
        <VendorDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVendors}</div>
            <p className="text-xs text-muted-foreground">{activeVendors} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeVendors}</div>
            <p className="text-xs text-muted-foreground">Currently working with</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchase Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalPurchaseValue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Lifetime value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Out of 5.0</p>
          </CardContent>
        </Card>
      </div>

      {/* Vendors Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vendors.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              No vendors found. Add your first vendor!
            </CardContent>
          </Card>
        ) : vendors.map(vendor => {
          const poCount = vendor.purchaseOrders.length
          const statusColor = vendor.status === 'ACTIVE' ? 'bg-green-500' : vendor.status === 'INACTIVE' ? 'bg-gray-500' : 'bg-red-500'
          
          return (
            <Card key={vendor.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{vendor.companyName}</CardTitle>
                      <Badge variant="outline" className={`${statusColor} text-white text-[10px] px-1.5 py-0`}>
                        {vendor.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{vendor.vendorId}</p>
                  </div>
                  <div className="flex gap-1">
                    <VendorDialog vendor={vendor} trigger={<Button variant="ghost" size="icon" className="h-7 w-7"><Edit2 className="h-3 w-3" /></Button>} />
                    <form action={async () => {
                      "use server"
                      await deleteVendor(vendor.id)
                    }}>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3 w-3" /></Button>
                    </form>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Contact Info */}
                <div className="space-y-1 text-xs">
                  {vendor.contactPerson && (
                    <div className="font-medium">{vendor.contactPerson}</div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{vendor.phone}</span>
                  </div>
                  {vendor.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{vendor.email}</span>
                    </div>
                  )}
                  {vendor.city && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{vendor.city}, {vendor.state}</span>
                    </div>
                  )}
                </div>

                {/* Business Details */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
                  <div>
                    <div className="text-muted-foreground">Category</div>
                    <div className="font-medium">{vendor.category || 'General'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Payment</div>
                    <div className="font-medium">{vendor.paymentTerms || 'NET30'}</div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Orders</div>
                    <div className="text-sm font-bold">{poCount}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Total Value</div>
                    <div className="text-sm font-bold">₹{vendor.totalPurchases.toFixed(0)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Rating</div>
                    <div className="text-sm font-bold flex items-center justify-center gap-0.5">
                      {vendor.rating.toFixed(1)}
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    </div>
                  </div>
                </div>

                {/* GST/PAN */}
                {(vendor.gstin || vendor.pan) && (
                  <div className="pt-2 border-t flex gap-2">
                    {vendor.gstin && <Badge variant="outline" className="text-[10px] px-1.5">GST: {vendor.gstin.slice(0, 10)}...</Badge>}
                    {vendor.pan && <Badge variant="outline" className="text-[10px] px-1.5">PAN: {vendor.pan}</Badge>}
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
