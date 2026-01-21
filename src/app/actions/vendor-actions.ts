"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createVendor(data: any) {
  try {
    const vendor = await prisma.vendor.create({
      data: {
        vendorId: data.vendorId,
        companyName: data.companyName,
        contactPerson: data.contactPerson || null,
        email: data.email || null,
        phone: data.phone,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        pincode: data.pincode || null,
        gstin: data.gstin || null,
        pan: data.pan || null,
        category: data.category || null,
        rating: data.rating || 3.0,
        paymentTerms: data.paymentTerms || null,
        creditLimit: data.creditLimit || null,
        status: data.status || "ACTIVE",
        notes: data.notes || null,
      },
    })
    revalidatePath("/vendors")
    return { success: true, vendor }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to create vendor" }
  }
}

export async function updateVendor(id: number, data: any) {
  try {
    const vendor = await prisma.vendor.update({
      where: { id },
      data: {
        companyName: data.companyName,
        contactPerson: data.contactPerson || null,
        email: data.email || null,
        phone: data.phone,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        pincode: data.pincode || null,
        gstin: data.gstin || null,
        pan: data.pan || null,
        category: data.category || null,
        rating: data.rating !== undefined ? data.rating : 3.0,
        paymentTerms: data.paymentTerms || null,
        creditLimit: data.creditLimit || null,
        status: data.status || "ACTIVE",
        notes: data.notes || null,
      },
    })
    revalidatePath("/vendors")
    return { success: true, vendor }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to update vendor" }
  }
}

export async function deleteVendor(id: number) {
  try {
    // Check if vendor has purchase orders
    const poCount = await prisma.purchaseOrder.count({
      where: { vendorId: id }
    })
    
    if (poCount > 0) {
      return { success: false, error: `Cannot delete vendor with ${poCount} purchase order(s). Please reassign or remove orders first.` }
    }
    
    await prisma.vendor.delete({
      where: { id }
    })
    revalidatePath("/vendors")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to delete vendor" }
  }
}

export async function getVendors() {
  try {
    const vendors = await prisma.vendor.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        purchaseOrders: true
      }
    })
    return vendors
  } catch (error) {
    console.error(error)
    return []
  }
}
