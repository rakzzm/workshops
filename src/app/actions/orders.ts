"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createPurchaseOrder(formData: FormData) {
  const supplier = formData.get("supplier") as string
  const items = formData.get("items") as string // JSON string
  
  if (!supplier || !items) {
    throw new Error("Missing required fields")
  }

  await prisma.purchaseOrder.create({
    data: {
      status: "PENDING",
      date: new Date(),
      items: items // Storing JSON string as per schema
    }
  })

  revalidatePath("/orders")
}

export async function updateOrderStatus(orderId: number, newStatus: string) {
  try {
    // transaction to ensure data integrity
    await prisma.$transaction(async (tx) => {
      // 1. Get the order
      const order = await tx.purchaseOrder.findUnique({
        where: { id: orderId }
      })

      if (!order) throw new Error("Order not found")

      // 2. If changing TO "RECEIVED" from something else, update stock
      if (newStatus === "RECEIVED" && order.status !== "RECEIVED") {
         const items = order.items ? JSON.parse(order.items) : []
         
         for (const item of items) {
            if (item.partId) {
               await tx.part.update({
                  where: { id: parseInt(item.partId) },
                  data: {
                     stock: {
                        increment: parseInt(item.quantity)
                     }
                  }
               })
            }
         }
      }

      // 3. Update the order status
      await tx.purchaseOrder.update({
        where: { id: orderId },
        data: { status: newStatus }
      })
    })

    revalidatePath("/orders")
    revalidatePath("/inventory") // Stock changes affect inventory
    return { success: true }
  } catch (error) {
    console.error("Update Order Status Error:", error)
    return { success: false, error: "Failed to update order status" }
  }
}

export async function deleteOrder(orderId: number) {
  try {
    await prisma.purchaseOrder.delete({
      where: { id: orderId }
    })
    revalidatePath("/orders")
    return { success: true }
  } catch (error) {
    console.error("Delete Order Error:", error)
    return { success: false, error: "Failed to delete order" }
  }
}
