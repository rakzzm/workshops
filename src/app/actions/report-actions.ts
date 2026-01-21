"use server"

import prisma from "@/lib/prisma"

export type DateRange = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all'

function getStartDate(range: DateRange) {
    const now = new Date()
    const start = new Date()
    
    switch(range) {
        case 'daily':
            start.setHours(0, 0, 0, 0)
            break
        case 'weekly':
            // start of current week (Sunday or Monday, let's say Monday)
            const day = start.getDay()
            const diff = start.getDate() - day + (day === 0 ? -6 : 1)
            start.setDate(diff)
            start.setHours(0, 0, 0, 0)
            break
        case 'monthly':
            start.setDate(1)
            start.setHours(0, 0, 0, 0)
            break
        case 'yearly':
            start.setMonth(0, 1)
            start.setHours(0, 0, 0, 0)
            break
        case 'all':
            return new Date(0) // Epoch
    }
    return start
}

export async function getGeneralStats(range: DateRange) {
    const startDate = getStartDate(range)
    
    const [totalRevenue, totalJobs, activeMechanics, lowStockItems] = await Promise.all([
        prisma.serviceRecord.aggregate({
            _sum: { totalCost: true },
            where: { 
                createdAt: { gte: startDate },
                status: 'COMPLETED'
            }
        }),
        prisma.serviceRecord.count({
            where: { createdAt: { gte: startDate } }
        }),
        prisma.mechanic.count({
            where: { status: 'ACTIVE' }
        }),
        prisma.part.count({
            where: { 
                stock: { lte: 5 } // Hardcoded low stock for now, can be dynamic
            }
        })
    ])

    return {
        revenue: totalRevenue._sum.totalCost || 0,
        jobs: totalJobs,
        mechanics: activeMechanics,
        lowStock: lowStockItems
    }
}

export async function getRevenueOverTime(range: DateRange) {
    // This is complex in Prisma w/ SQLite solely effectively. 
    // We will fetch raw data and group in JS for simplicity and flexibility across DBs.
    const startDate = getStartDate(range)
    
    const records = await prisma.serviceRecord.findMany({
        where: { createdAt: { gte: startDate }, status: 'COMPLETED' },
        select: { createdAt: true, totalCost: true },
        orderBy: { createdAt: 'asc' }
    })

    // Grouping logic
    const grouped: Record<string, number> = {}
    
    records.forEach(r => {
        let key = ''
        const date = new Date(r.createdAt)
        
        switch(range) {
            case 'daily':
                key = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                break
            case 'weekly':
                key = date.toLocaleDateString([], { weekday: 'short' })
                break
            case 'monthly':
                 key = date.toLocaleDateString([], { day: 'numeric', month: 'short' })
                break
            case 'yearly':
                key = date.toLocaleDateString([], { month: 'short' })
                break
            case 'all':
                 key = date.toLocaleDateString([], { month: 'short', year: '2-digit' })
                break
        }
        
        grouped[key] = (grouped[key] || 0) + r.totalCost
    })

    return Object.entries(grouped).map(([name, value]) => ({ name, value }))
}

export async function getServiceDistribution(range: DateRange) {
    const startDate = getStartDate(range)
    
    const byStatus = await prisma.serviceRecord.groupBy({
        by: ['status'],
        where: { createdAt: { gte: startDate } },
        _count: { id: true }
    })
    
    const byType = await prisma.serviceRecord.groupBy({
        by: ['serviceType'],
        where: { createdAt: { gte: startDate } },
        _count: { id: true }
    })

    return {
        status: byStatus.map(s => ({ name: s.status, value: s._count.id })),
        type: byType.map(t => ({ name: t.serviceType || 'Unspecified', value: t._count.id }))
    }
}

export async function getDetailedReport(range: DateRange) {
    const startDate = getStartDate(range)
    
    // Fetch recent 100 for table
    return await prisma.serviceRecord.findMany({
        where: { createdAt: { gte: startDate } },
        include: { vehicle: true, mechanic: true },
        orderBy: { createdAt: 'desc' },
        take: 100
    })
}

export async function getInventoryValuation() {
    const parts = await prisma.part.findMany()
    const valuation = parts.reduce((acc, part) => acc + (part.price * part.stock), 0)
    const count = parts.reduce((acc, part) => acc + part.stock, 0)
    
    // Top 5 by Value
    const topValue = [...parts].sort((a, b) => (b.price * b.stock) - (a.price * a.stock)).slice(0, 5)

    return {
        valuation,
        count,
        topValue: topValue.map(p => ({ name: p.name, value: p.price * p.stock }))
    }
}
