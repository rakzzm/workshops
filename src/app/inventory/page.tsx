import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import prisma from "@/lib/prisma"
import { MOCK_PARTS } from "@/lib/mock-data"
export const dynamic = 'force-dynamic'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"
import { PartDialog } from "@/components/inventory/part-dialog"
import { PartActions } from "@/components/inventory/part-actions"
import Link from "next/link"

export default async function InventoryPage(props: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams
  const query = searchParams.q
  
  let parts: any[] = []
  try {
    parts = await prisma.part.findMany({
      where: query ? {
         OR: [
           { name: { contains: query } },
           { category: { contains: query } },
           { sku: { contains: query } }
         ]
      } : undefined,
      orderBy: { stock: 'asc' } // Low stock first
    })
  } catch (error) {
    console.log('Database unavailable, using mock parts')
    parts = MOCK_PARTS
  }

  return (
     <div className="space-y-6">
       <div className="flex justify-between items-center">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
            <p className="text-muted-foreground">Manage parts, stock levels, and prices.</p>
         </div>
         <PartDialog />
       </div>
       
       <div className="flex items-center gap-4">
         <form className="flex-1 flex gap-2 w-full max-w-full lg:max-w-md">
            <Input 
                name="q" 
                placeholder="Search parts by Name, SKU, Category..." 
                defaultValue={query}
            />
            <Button type="submit" size="icon" variant="secondary">
                <Search className="h-4 w-4"/>
            </Button>
            {query && (
                <Button variant="ghost" asChild>
                    <Link href="/inventory">Clear</Link>
                </Button>
            )}
         </form>
         <Button variant="outline" size="icon"><Filter className="h-4 w-4"/></Button>
       </div>

       <div className="border rounded-md bg-card">
         <Table>
            <TableHeader>
               <TableRow>
                  <TableHead className="w-[100px]">SKU</TableHead>
                  <TableHead className="w-[300px]">Part Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
              {parts.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                        {query ? 'No parts match your search.' : 'No parts in inventory.'}
                    </TableCell>
                 </TableRow>
              ) : parts.map(part => (
                 <TableRow key={part.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{part.sku}</TableCell>
                    <TableCell className="font-medium">{part.name}</TableCell>
                    <TableCell>
                        <Badge variant="secondary" className="font-normal">{part.category}</Badge>
                    </TableCell>
                    <TableCell>
                        <span className={part.stock <= part.minStockLevel ? "text-red-500 font-bold" : ""}>
                            {part.stock}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">/ {part.minStockLevel} min</span>
                    </TableCell>
                    <TableCell>₹{part.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                       {part.stock <= part.minStockLevel ? (
                          <Badge variant="destructive">Low Stock</Badge>
                       ) : (
                          <Badge variant="outline" className="text-green-600 border-green-600 bg-green-500/10">In Stock</Badge>
                       )}
                    </TableCell>
                    <TableCell>
                        <PartActions part={part} />
                    </TableCell>
                 </TableRow>
              ))}
            </TableBody>
         </Table>
       </div>
     </div>
  )
}
