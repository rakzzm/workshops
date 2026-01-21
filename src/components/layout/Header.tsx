"use client"

import { Menu, LayoutGrid, Clock, ClipboardList, Settings2, Wrench, Users2, Box, ScanBarcode, FileSignature, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
// import { Sidebar } from "./Sidebar" // Removed unused import
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

import Image from "next/image"

// duplicate nav for now to avoid props drilling complexity in this quick iteration
const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutGrid },
  { name: "Service History", href: "/services", icon: Clock },
  { name: "Job Board", href: "/jobs", icon: ClipboardList },
  { name: "Customers", href: "/customers", icon: Users2 },
  { name: "Mechanics", href: "/mechanics", icon: Wrench },
  { name: "Inventory", href: "/inventory", icon: Box },
  { name: "Parts Catalog", href: "/parts", icon: ScanBarcode },
  { name: "Purchase Orders", href: "/orders", icon: FileSignature },
  { name: "Vendors", href: "/vendors", icon: Store },
  { name: "Settings", href: "/settings", icon: Settings2 },
]

export function Header() {
  const pathname = usePathname()
  
  return (
    <header className="flex h-16 items-center border-b bg-background px-4 md:px-6 md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="mr-4 md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-6 pt-12">
             {/* Gradient Definition for Icons */}
             <svg width="0" height="0" className="absolute">
                <defs>
                  <linearGradient id="icon-gradient-mobile" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" /> {/* Blue-500 */}
                    <stop offset="100%" stopColor="#ec4899" /> {/* Pink-500 */}
                  </linearGradient>
                </defs>
             </svg>

             <div className="flex items-center gap-4 px-2 mb-10">
                <div className="relative h-14 w-14 overflow-hidden rounded-xl">
                   <Image 
                     src="/logo.png" 
                     alt="AutoFix Logo" 
                     fill
                     className="object-cover"
                   />
                </div>
                <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">AutoFix AI</span>
              </div>
              <nav className="space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-4 px-4 py-3 rounded-lg text-base font-bold transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-blue-500/10 to-pink-500/10 text-blue-600 shadow-sm border border-blue-100"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon 
                        className={cn("h-6 w-6 transition-transform duration-200 group-hover:scale-110", isActive ? "scale-110" : "")} 
                        style={{ stroke: isActive ? "url(#icon-gradient-mobile)" : "currentColor" }}
                      />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
        </SheetContent>
      </Sheet>
      <div className="flex items-center gap-3">
         <div className="relative h-10 w-10 overflow-hidden rounded-lg">
           <Image 
             src="/logo.png" 
             alt="AutoFix Logo" 
             fill
             className="object-cover"
           />
         </div>
         <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">AutoFix AI</span>
      </div>
    </header>
  )
}
