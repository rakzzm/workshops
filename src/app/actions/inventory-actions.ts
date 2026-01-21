"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createPart(data: any) {
  try {
    // Validate required fields (basic)
    if (!data.name || !data.sku) {
        return { success: false, error: "Name and SKU are required" }
    }

    // Check for unique SKU
    const existing = await prisma.part.findUnique({
        where: { sku: data.sku }
    })
    if (existing) {
        return { success: false, error: "SKU already exists" }
    }

    await prisma.part.create({
      data: {
        name: data.name,
        sku: data.sku,
        category: data.category || "General",
        price: parseFloat(data.price) || 0,
        stock: parseInt(data.stock) || 0,
        minStockLevel: parseInt(data.minStockLevel) || 5, // Default min stock
        imageUrl: data.imageUrl || null
      }
    })

    revalidatePath("/inventory")
    revalidatePath("/parts")
    return { success: true }
  } catch (error) {
    console.error("Create Part Error:", error)
    return { success: false, error: "Failed to create part" }
  }
}

export async function updatePart(id: number, data: any) {
    try {
        await prisma.part.update({
            where: { id },
            data: {
                name: data.name,
                sku: data.sku,
                category: data.category,
                price: parseFloat(data.price) || 0,
                stock: parseInt(data.stock) || 0,
                minStockLevel: parseInt(data.minStockLevel) || 5,
                imageUrl: data.imageUrl || null
            }
        })
        revalidatePath("/inventory")
        revalidatePath("/parts")
        return { success: true }
    } catch (error) {
        console.error("Update Part Error:", error)
        return { success: false, error: "Failed to update part" }
    }
}

export async function deletePart(id: number) {
    try {
        await prisma.part.delete({
            where: { id }
        })
        revalidatePath("/inventory")
        return { success: true }
    } catch (error) {
        console.error("Delete Part Error:", error)
        return { success: false, error: "Failed to delete part" }
    }
}
