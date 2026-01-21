"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ImageOff } from "lucide-react"
import Image from "next/image"
import { PartActions } from "@/components/inventory/part-actions"

interface Part {
  id: number
  name: string
  sku: string
  category: string
  price: number
  stock: number
  stockLevel?: number // Optional if sometimes raw
  minStockLevel: number
  imageUrl?: string | null
  description?: string | null
  location?: string | null
}

export function PartCard({ part }: { part: Part }) {
  // Normalize part data for actions if needed
  const partForActions = {
      ...part,
      minStockLevel: part.minStockLevel || 5
  }

  return (
    <Card className="flex flex-col h-full overflow-visible hover:shadow-lg transition-shadow bg-card/60 backdrop-blur-sm group">
      <div className="relative aspect-square w-full bg-muted flex items-center justify-center overflow-hidden rounded-t-lg">
        {part.imageUrl ? (
          <Image
            src={part.imageUrl}
            alt={part.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex flex-col items-center text-muted-foreground p-4 text-center">
            <ImageOff className="h-10 w-10 mb-2 opacity-30" />
            <span className="text-xs opacity-50">No image</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
             <Badge variant={part.stock > 0 ? "secondary" : "destructive"} className="shadow-sm">
                {part.stock > 0 ? `${part.stock} in stock` : "Out of stock"}
             </Badge>
        </div>
      </div>
      
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
            <div className="space-y-1 w-full">
                <div className="flex justify-between w-full">
                    <p className="text-xs text-muted-foreground font-mono">{part.sku}</p>
                    <PartActions part={partForActions} />
                </div>
                <CardTitle className="text-base line-clamp-2 leading-tight">{part.name}</CardTitle>
            </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-1 flex-1">
         <Badge variant="outline" className="text-xs font-normal">{part.category}</Badge>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between border-t bg-muted/10 mt-auto py-3">
        <div className="font-bold text-lg text-primary">
            ₹{part.price.toFixed(2)}
        </div>
      </CardFooter>
    </Card>
  )
}
