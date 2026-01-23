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
    console.warn("Dashboard stats error (using mock data):", error)
    
    // Fallback using MOCK data
    const { MOCK_CUSTOMERS, MOCK_VEHICLES, MOCK_MECHANICS, MOCK_PARTS, MOCK_VENDORS, MOCK_JOBS, MOCK_SERVICE_RECORDS, MOCK_PURCHASE_ORDERS } = require("@/lib/mock-data")

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    // Calculate revenue metrics from mock data
    const completedJobs = MOCK_JOBS.filter((j: any) => j.status === "COMPLETED")
    const completedServices = MOCK_SERVICE_RECORDS.filter((s: any) => s.status === "COMPLETED")

    const totalRevenue = completedJobs.reduce((sum: number, job: any) => sum + (job.finalCost || 0), 0) +
                        completedServices.reduce((sum: number, service: any) => sum + service.totalCost, 0)

    const monthlyRevenue = completedJobs
      .filter((job: any) => job.completedAt && new Date(job.completedAt) >= startOfMonth)
      .reduce((sum: number, job: any) => sum + (job.finalCost || 0), 0) +
      completedServices
        .filter((service: any) => new Date(service.createdAt) >= startOfMonth)
        .reduce((sum: number, service: any) => sum + service.totalCost, 0)
    
    const todayRevenue = completedJobs
      .filter((job: any) => job.completedAt && new Date(job.completedAt) >= today)
      .reduce((sum: number, job: any) => sum + (job.finalCost || 0), 0) +
      completedServices
        .filter((service: any) => new Date(service.createdAt) >= today)
        .reduce((sum: number, service: any) => sum + service.totalCost, 0)

    // Revenue trend
    const revenueData = []
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        // Simple mock trend if dates don't align perfectly, or real calc
        // Let's do real calc for consistency
         const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + 1)
        
        const dayRevenue = completedJobs
            .filter((job: any) => job.completedAt && new Date(job.completedAt) >= date && new Date(job.completedAt) < nextDate)
            .reduce((sum: number, job: any) => sum + (job.finalCost || 0), 0) +
            completedServices
            .filter((service: any) => new Date(service.createdAt) >= date && new Date(service.createdAt) < nextDate)
            .reduce((sum: number, service: any) => sum + service.totalCost, 0)

        revenueData.push({
            date: date.toISOString().split('T')[0],
            total: dayRevenue
        })
    }

    // Services by type
    const servicesByType: Record<string, number> = {}
    completedJobs.forEach((job: any) => {
        servicesByType[job.repairType] = (servicesByType[job.repairType] || 0) + 1
    })

    // Inventory value
    const totalInventoryValue = MOCK_PARTS.reduce((sum: number, part: any) => sum + (part.stock * part.price), 0)

    const avgJobValue = completedJobs.length > 0 
      ? completedJobs.reduce((sum: number, job: any) => sum + (job.finalCost || 0), 0) / completedJobs.length 
      : 0

      // Mechanic stats
      const mechanicStats = MOCK_MECHANICS.map((mech: any) => {
          const jobCount = MOCK_JOBS.filter((j: any) => j.mechanicId === mech.id && j.status === 'COMPLETED').length
          const serviceCount = MOCK_SERVICE_RECORDS.filter((s: any) => s.mechanicId === mech.id && s.status === 'COMPLETED').length
          return {
            name: mech.name,
            completedJobs: jobCount + serviceCount,
            rating: mech.performanceRating,
            availability: mech.availability
          }
      }).sort((a: any, b: any) => b.completedJobs - a.completedJobs).slice(0, 5)

    return {
      totalRevenue,
      monthlyRevenue,
      todayRevenue,
      avgJobValue,
      totalCustomers: MOCK_CUSTOMERS.length,
      totalVehicles: MOCK_VEHICLES.length,
      totalMechanics: MOCK_MECHANICS.length,
      totalParts: MOCK_PARTS.length,
      totalVendors: MOCK_VENDORS.length,
      lowStockParts: MOCK_PARTS.filter((p: any) => p.stock <= 10).length,
      totalInventoryValue,
      totalJobs: MOCK_JOBS.length,
      completedJobsCount: completedJobs.length,
      pendingJobs: MOCK_JOBS.filter((j: any) => j.status === "PENDING").length,
      approvedJobs: MOCK_JOBS.filter((j: any) => j.status === "APPROVED").length,
      inProgressJobs: MOCK_JOBS.filter((j: any) => j.status === "IN_PROGRESS").length,
      rejectedJobs: MOCK_JOBS.filter((j: any) => j.status === "REJECTED").length,
      pendingOrders: MOCK_PURCHASE_ORDERS.filter((p: any) => p.status === "PENDING").length,
      totalPOs: MOCK_PURCHASE_ORDERS.length,
      totalServices: completedServices.length,
      vehiclesServicedToday: completedServices.filter((s: any) => new Date(s.createdAt) >= today).length,
      revenueData,
      servicesByType: Object.entries(servicesByType).map(([type, count]) => ({ type, count })),
      recentServices: MOCK_SERVICE_RECORDS.slice(0, 5),
      recentJobs: MOCK_JOBS.slice(0, 5),
      recentOrders: [],
      topMechanics: mechanicStats,
      jobStatusDistribution: {
        pending: MOCK_JOBS.filter((j: any) => j.status === "PENDING").length,
        approved: MOCK_JOBS.filter((j: any) => j.status === "APPROVED").length,
        inProgress: MOCK_JOBS.filter((j: any) => j.status === "IN_PROGRESS").length,
        completed: completedJobs.length,
        rejected: MOCK_JOBS.filter((j: any) => j.status === "REJECTED").length
      }
    }
  }
}
