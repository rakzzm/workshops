"use server"

import prisma from "@/lib/prisma"

export async function getDashboardStats() {
  try {
    // Date calculations
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    
    // Parallel data fetching for performance
    const [
      totalCustomers,
      totalVehicles,
      totalMechanics,
      totalParts,
      totalVendors,
      lowStockParts,
      pendingPOs,
      totalPOs,
      completedJobs,
      pendingJobs,
      approvedJobs,
      inProgressJobs,
      rejectedJobs,
      completedServices,
      recentServices,
      recentJobs,
      inventoryValue,
      mechanics,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.vehicle.count(),
      prisma.mechanic.count(),
      prisma.part.count(),
      prisma.vendor.count({ where: { status: "ACTIVE" } }),
      prisma.part.count({ where: { stock: { lte: 10 } } }),
      prisma.purchaseOrder.count({ where: { status: "PENDING" } }),
      prisma.purchaseOrder.count(),
      prisma.jobBoard.findMany({
        where: { status: "COMPLETED" },
        include: { customer: true, vehicle: true, mechanic: true }
      }),
      prisma.jobBoard.count({ where: { status: "PENDING" } }),
      prisma.jobBoard.count({ where: { status: "APPROVED" } }),
      prisma.jobBoard.count({ where: { status: "IN_PROGRESS" } }),
      prisma.jobBoard.count({ where: { status: "REJECTED" } }),
      prisma.serviceRecord.findMany({
        where: { status: "COMPLETED" },
        orderBy: { createdAt: "desc" },
        include: { vehicle: true, mechanic: true, parts: { include: { part: true } } }
      }),
      prisma.serviceRecord.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { vehicle: true, mechanic: true }
      }),
      prisma.jobBoard.findMany({
        orderBy: { submittedAt: "desc" },
        take: 5,
        include: { customer: true, vehicle: true }
      }),
      prisma.part.findMany({ select: { stock: true, price: true } }),
      prisma.mechanic.findMany({
        include: {
          serviceRecords: { where: { status: "COMPLETED" } },
          jobs: { where: { status: "COMPLETED" } }
        }
      }),
    ])

    // Calculate revenue metrics
    const totalRevenue = completedJobs.reduce((sum, job) => sum + (job.finalCost || 0), 0) +
                        completedServices.reduce((sum, service) => sum + service.totalCost, 0)
    
    const monthlyRevenue = completedJobs
      .filter(job => job.completedAt && job.completedAt >= startOfMonth)
      .reduce((sum, job) => sum + (job.finalCost || 0), 0) +
      completedServices
        .filter(service => service.createdAt >= startOfMonth)
        .reduce((sum, service) => sum + service.totalCost, 0)
    
    const todayRevenue = completedJobs
      .filter(job => job.completedAt && job.completedAt >= today)
      .reduce((sum, job) => sum + (job.finalCost || 0), 0) +
      completedServices
        .filter(service => service.createdAt >= today)
        .reduce((sum, service) => sum + service.totalCost, 0)

    // Revenue trend data (last 30 days)
    const revenueData = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)
      
      const dayRevenue = completedJobs
        .filter(job => job.completedAt && job.completedAt >= date && job.completedAt < nextDate)
        .reduce((sum, job) => sum + (job.finalCost || 0), 0) +
        completedServices
          .filter(service => service.createdAt >= date && service.createdAt < nextDate)
          .reduce((sum, service) => sum + service.totalCost, 0)
      
      revenueData.push({
        date: date.toISOString().split('T')[0],
        total: dayRevenue
      })
    }

    // Service distribution by repair type
    const servicesByType: Record<string, number> = {}
    completedJobs.forEach(job => {
      servicesByType[job.repairType] = (servicesByType[job.repairType] || 0) + 1
    })

    // Calculate inventory value
    const totalInventoryValue = inventoryValue.reduce((sum, part) => sum + (part.stock * part.price), 0)

    // Mechanic performance
    const mechanicStats = mechanics.map(mech => ({
      name: mech.name,
      completedJobs: mech.jobs.length + mech.serviceRecords.length,
      rating: mech.performanceRating,
      availability: mech.availability
    })).sort((a, b) => b.completedJobs - a.completedJobs)

    // Calculate averages
    const avgJobValue = completedJobs.length > 0 
      ? completedJobs.reduce((sum, job) => sum + (job.finalCost || 0), 0) / completedJobs.length 
      : 0

    return {
      // KPI Metrics
      totalRevenue,
      monthlyRevenue,
      todayRevenue,
      avgJobValue,
      totalCustomers,
      totalVehicles,
      totalMechanics,
      totalParts,
      totalVendors,
      lowStockParts,
      totalInventoryValue,
      
      // Job metrics
      totalJobs: completedJobs.length + pendingJobs + approvedJobs + inProgressJobs + rejectedJobs,
      completedJobsCount: completedJobs.length,
      pendingJobs,
      approvedJobs,
      inProgressJobs,
      rejectedJobs,
      
      // Purchase orders
      pendingOrders: pendingPOs,
      totalPOs,
      
      // Services
      totalServices: completedServices.length,
      vehiclesServicedToday: completedServices.filter(s => s.createdAt >= today).length,
      
      // Charts data
      revenueData,
      servicesByType: Object.entries(servicesByType).map(([type, count]) => ({ type, count })),
      
      // Recent activity
      recentServices,
      recentJobs,
      recentOrders: [],
      
      // Performance
      topMechanics: mechanicStats.slice(0, 5),
      
      // Status distribution
      jobStatusDistribution: {
        pending: pendingJobs,
        approved: approvedJobs,
        inProgress: inProgressJobs,
        completed: completedJobs.length,
        rejected: rejectedJobs
      }
    }
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return {
      totalRevenue: 0,
      monthlyRevenue: 0,
      todayRevenue: 0,
      avgJobValue: 0,
      totalCustomers: 0,
      totalVehicles: 0,
      totalMechanics: 0,
      totalParts: 0,
      totalVendors: 0,
      lowStockParts: 0,
      totalInventoryValue: 0,
      totalJobs: 0,
      completedJobsCount: 0,
      pendingJobs: 0,
      approvedJobs: 0,
      inProgressJobs: 0,
      rejectedJobs: 0,
      pendingOrders: 0,
      totalPOs: 0,
      totalServices: 0,
      vehiclesServicedToday: 0,
      revenueData: [],
      servicesByType: [],
      recentServices: [],
      recentJobs: [],
      recentOrders: [],
      topMechanics: [],
      jobStatusDistribution: { pending: 0, approved: 0, inProgress: 0, completed: 0, rejected: 0 }
    }
  }
}
