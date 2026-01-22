// Shared type definitions for Report and Analytics

export interface ChartDataPoint {
  name: string
  value: number
  [key: string]: string | number
}

export interface ReportFilter {
  startDate?: string
  endDate?: string
  vehicleType?: string
  status?: string
  mechanicId?: number
  [key: string]: string | number | undefined
}

export interface RevenueData {
  month: string
  revenue: number
  expenses: number
  profit: number
}

export interface ServiceMetrics {
  totalServices: number
  completedServices: number
  pendingServices: number
  averageServiceCost: number
  totalRevenue: number
}

export interface InventoryMetrics {
  totalParts: number
  lowStockParts: number
  totalInventoryValue: number
  reorderNeeded: number
}

export interface PopularPart {
  partId: number
  partName: string
  usageCount: number
  revenue: number
}

export interface VehicleTypeDistribution {
  type: string
  count: number
  percentage: number
}
