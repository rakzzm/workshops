import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import prisma from "@/lib/prisma"
import { MOCK_PARTS } from "@/lib/mock-data"
export const dynamic = 'force-dynamic'
import { PartCard } from "@/components/parts/part-card"
import { PartDialog } from "@/components/inventory/part-dialog"

export default async function PartsPage(props: { searchParams: Promise<{ q?: string }> }) {
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
      orderBy: { name: 'asc' }
    })
  } catch (error) {
    console.error('Database error, using mock data:', error)
    // Filter mock data by query if present
    parts = MOCK_PARTS.filter(part => {
      if (!query) return true
      const lowerQuery = query.toLowerCase()
      return (
        part.name.toLowerCase().includes(lowerQuery) ||
        part.category.toLowerCase().includes(lowerQuery) ||
        part.sku.toLowerCase().includes(lowerQuery)
      )
    }) as any[]
  }

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Parts Catalog</h1>
            <p className="text-muted-foreground">Browse our complete inventory of authentic parts.</p>
         </div>
         <div className="flex gap-2">
            <PartDialog />
         </div>
       </div>

       <div className="flex flex-col md:flex-row gap-4 items-center bg-muted/20 p-4 rounded-lg border">
         <form className="flex w-full md:w-auto items-center gap-2 flex-1">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    name="q"
                    placeholder="Search by name, SKU, or category..."
                    className="pl-8 bg-background"
                    defaultValue={query}
                />
            </div>
            <Button type="submit">Search</Button>
         </form>
       </div>
 
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {parts.length === 0 ? (
              <div className="col-span-full h-64 flex items-center justify-center border border-dashed rounded-lg bg-muted/40">
                  <p className="text-muted-foreground">No parts found matching your criteria.</p>
              </div>
          ) : parts.map(part => (
              <PartCard key={part.id} part={part} />
          ))}
       </div>
    </div>
  )
}
