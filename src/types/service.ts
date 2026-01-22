// Shared type definitions for Service-related entities

export interface Vehicle {
  id: number
  regNumber: string
  model: string
  type: string
  ownerName: string
  ownerPhone: string | null
  ownerAddress: string | null
  ownerGstin: string | null
  chassisNumber: string | null
  engineNumber: string | null
  ownerId: string | null
  customerId?: number | null
  createdAt?: Date
  updatedAt?: Date
}

export interface Part {
  id: number
  name: string
  sku: string
  category: string
  price: number
  stock: number
  minStockLevel: number
  createdAt?: Date
  updatedAt?: Date
}

export interface Mechanic {
  id: number
  name: string
  phone: string | null
  specialization: string | null
  status: string
  createdAt?: Date
  updatedAt?: Date
}

export interface ServicePart {
  id: number
  serviceId: number
  partId: number
  quantity: number
  part: Part
}

export interface ServiceRecord {
  id: number
  date: Date | string
  vehicleId: number
  mechanicId?: number | null
  description: string
  laborCost: number
  totalCost: number
  status: string
  oilChange?: boolean
  vehicle: Vehicle
  mechanic?: Mechanic | null
  parts: ServicePart[]
  createdAt?: Date
  updatedAt?: Date
}

export interface ServiceFormData {
  vehicleId: string
  date: string
  description: string
  laborCost: string
  parts: Array<{ partId: string; quantity: string }>
  mechanicId?: string
  oilChange?: boolean
}
