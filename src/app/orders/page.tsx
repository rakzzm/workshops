// Button import removed
import prisma from "@/lib/prisma"
import { MOCK_PURCHASE_ORDERS, MOCK_PARTS } from "@/lib/mock-data"
export const dynamic = 'force-dynamic'
import { CreateOrderDialog } from "@/components/purchase-orders/create-order-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { OrderActions } from "@/components/purchase-orders/order-actions"

export default async function PurchaseOrdersPage() {
  let orders: any[] = []
  let parts: any[] = []
  
  try {
    orders = await prisma.purchaseOrder.findMany()
  } catch (error) {
    console.error('Database error for orders, using mock data:', error)
    orders = MOCK_PURCHASE_ORDERS as any[]
  }

  try {
    parts = await prisma.part.findMany({
      select: { id: true, name: true, sku: true }
    })
  } catch (error) {
    console.error('Database error for parts, using mock data:', error)
    parts = MOCK_PARTS.map(p => ({ id: p.id, name: p.name, sku: p.sku })) as any[]
  }

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
            <p className="text-muted-foreground">Manage orders to suppliers.</p>
         </div>
         <CreateOrderDialog parts={parts} />
       </div>

       <div className="border rounded-md bg-card">
         <Table>
            <TableHeader>
               <TableRow>
                  <TableHead className="w-[100px]">Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                        No purchase orders found.
                    </TableCell>
                 </TableRow>
              ) : orders.map(order => {
                  let itemCount = 0
                  try {
                      const items = order.items ? JSON.parse(order.items) : []
                      itemCount = items.length
                  } catch {
                      itemCount = 0
                  }

                  return (
                    <TableRow key={order.id}>
                        <TableCell className="font-mono">#{order.id}</TableCell>
                        <TableCell>
                            {new Date((order as any).orderDate || (order as any).date).toLocaleDateString("en-US", {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </TableCell>
                        <TableCell>
                            <Badge variant={order.status === "RECEIVED" ? "default" : order.status === "ORDERED" ? "secondary" : "outline"}>
                                {order.status}
                            </Badge>
                        </TableCell>
                        <TableCell>{itemCount} items</TableCell>
                        <TableCell className="text-right">
                            <OrderActions order={order} />
                        </TableCell>
                    </TableRow>
                  )
              })}
            </TableBody>
         </Table>
       </div>
    </div>
  )
}
