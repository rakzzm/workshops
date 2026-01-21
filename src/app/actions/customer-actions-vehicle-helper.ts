// Add to customer-actions.ts
"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createVehicleForCustomer(customerId: number, vehicleData: any) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    })
    
    if (!customer) {
      return { success: false, error: "Customer not found" }
    }
    
    const vehicle = await prisma.vehicle.create({
      data: {
        regNumber: vehicleData.regNumber,
        model: vehicleData.model,
        type: vehicleData.type,
        ownerName: `${customer.firstName} ${customer.lastName}`,
        chassisNumber: vehicleData.chassisNumber || null,
        engineNumber: vehicleData.engineNumber || null,
        ownerPhone: customer.phone,
        ownerAddress: customer.address || null,
        ownerGstin: customer.gstin || null,
        customerId: customer.id,
      },
    })
    
    revalidatePath("/customers")
    return { success: true, vehicle }
  } catch (error: any) {
    console.error(error)
    if (error.code === 'P2002') {
      return { success: false, error: "Vehicle with this registration number already exists" }
    }
    return { success: false, error: "Failed to create vehicle" }
  }
}
