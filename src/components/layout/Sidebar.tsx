"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutGrid, Clock, ClipboardList, Settings2, Wrench, Users2, Box, ScanBarcode, Store, ChartBar, MessageSquare, Car, Shield, ShoppingCart } from "lucide-react"
import { useSession } from "next-auth/react"
import { signOutAction } from "@/app/actions/signout-action"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutGrid, roles: ['ADMIN', 'USER'] },
  { name: "Job Board", href: "/jobs", icon: ClipboardList, roles: ['ADMIN'] },
  { name: "Service Management", href: "/services", icon: Wrench, roles: ['ADMIN'] },
  { name: "Inventory", href: "/inventory", icon: Box, roles: ['ADMIN'] },
  { name: "Parts Catalog", href: "/parts", icon: ScanBarcode, roles: ['ADMIN'] },
  { name: "Purchase Orders", href: "/orders", icon: ShoppingCart, roles: ['ADMIN'] },
  { name: "Mechanics", href: "/mechanics", icon: Wrench, roles: ['ADMIN'] },
  { name: "Customers", href: "/customers", icon: Users2, roles: ['ADMIN'] },
  { name: "Vehicle Service History", href: "/service-history", icon: Clock, roles: ['ADMIN', 'USER'] },
  { name: "Reports", href: "/reports", icon: ChartBar, roles: ['ADMIN'] },
  { name: "Feedback", href: "/feedback", icon: MessageSquare, roles: ['ADMIN'] },
  { name: "Vendors", href: "/vendors", icon: Store, roles: ['ADMIN'] },
  { name: "Support", href: "/support", icon: Shield, roles: ['USER'] },
  { name: "Settings", href: "/settings", icon: Settings2, roles: ['ADMIN', 'USER'] },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  
  // Default to GUEST if loading or no session meant to be handled by middleware
  const userRole = session?.user?.role || 'GUEST'

  // Filter items based on role
  const filteredNav = navigation.filter(item => {
    // If Admin, show everything ideally, or stick to explicit roles. 
    // Let's stick to explicit roles for clarity. 
    // Actually, Admin might want to see 'Support' page to test it? 
    // For strict RBAC as requested: "IF ROLE === 'USER': Show ONLY Service History and Settings"
    
    if (userRole === 'ADMIN') {
        // Hide User-specific 'Support' link from Admin to avoid clutter? 
        // Or show it so they can verify. Let's hide it to keep Admin menu clean (Admin uses Feedback module)
        if (item.name === 'Support') return false 
        return true
    }
    
    if (userRole === 'USER') {
        return item.roles.includes('USER')
    }

    return false
  })

  // Hide on auth pages
  if (pathname === '/login' || pathname === '/signup') return null

  return (
    <div className="flex h-screen w-16 flex-col justify-between border-r bg-background/60 backdrop-blur-xl transition-all duration-300 hover:w-64 group z-20 shadow-xl overflow-hidden">
      <div className="flex flex-col h-full">
        <div className="flex h-16 items-center justify-center border-b px-4 group-hover:justify-start">
            <div className="relative h-8 w-8 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
             <Car className="h-5 w-5 text-primary" />
            </div>
            <span className="ml-3 font-bold text-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100 whitespace-nowrap">
              AutoFix
            </span>
        </div>

        <nav className="flex-1 space-y-2 p-2 overflow-y-auto scrollbar-hide">
          {filteredNav.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors relative group/item",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
                <span className="ml-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 whitespace-nowrap">
                  {item.name}
                </span>
                
                {isActive && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-primary" />
                )}
              </Link>
            )
          })}
        </nav>
        
        {/* User Profile Mini Section */}
        {session?.user ? (
            <div className="border-t p-2">
                <div className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted group/profile">
                    <div className="h-8 w-8 rounded-full bg-slate-200 shrink-0 flex items-center justify-center text-xs font-bold text-slate-700 uppercase">
                        {session.user.name?.charAt(0) || 'U'}
                    </div>
                    <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap flex-1 overflow-hidden">
                        <div className="text-foreground font-semibold truncate">{session.user.name}</div>
                        <div className="text-xs truncate uppercase">{session.user.role}</div>
                    </div>
                </div>
                
                {/* Logout Button (Only visible on hover or simplified) */}
                 <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity px-3 pb-2">
                    <form action={signOutAction}>
                        <button className="text-xs text-red-500 hover:text-red-700 w-full text-left flex items-center gap-2">
                            <Shield className="h-3 w-3" /> Sign Out
                        </button>
                    </form>
                </div>
            </div>
        ) : (
             <div className="border-t p-2">
                <Link href="/login" className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-blue-500/10 hover:text-blue-600">
                    <div className="h-8 w-8 rounded-full bg-slate-100 shrink-0 flex items-center justify-center">
                        <Shield className="h-4 w-4" />
                    </div>
                    <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">
                        Sign In
                    </div>
                </Link>
            </div>
        )}
      </div>
    </div>
  )
}
