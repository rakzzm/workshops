"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createMechanic(data: any) {
  try {
    const mechanic = await prisma.mechanic.create({
      data: {
        employeeId: data.employeeId,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        specialization: data.specialization || null,
        department: data.department || null,
        yearsExperience: data.yearsExperience || 0,
        hourlyRate: data.hourlyRate || 0,
        performanceRating: data.performanceRating || 3.5,
        availability: data.availability || "AVAILABLE",
        shift: data.shift || null,
        status: data.status || "ACTIVE",
        emergencyContact: data.emergencyContact || null,
        notes: data.notes || null,
      },
    })
    revalidatePath("/mechanics")
    return { success: true, mechanic }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to create mechanic" }
  }
}

export async function updateMechanic(id: number, data: any) {
  try {
    const mechanic = await prisma.mechanic.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        specialization: data.specialization || null,
        department: data.department || null,
        yearsExperience: data.yearsExperience || 0,
        hourlyRate: data.hourlyRate || 0,
        performanceRating: data.performanceRating || 3.5,
        availability: data.availability || "AVAILABLE",
        shift: data.shift || null,
        status: data.status || "ACTIVE",
        emergencyContact: data.emergencyContact || null,
        notes: data.notes || null,
      },
    })
    revalidatePath("/mechanics")
    return { success: true, mechanic }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to update mechanic" }
  }
}

export async function deleteMechanic(id: number) {
  try {
    await prisma.mechanic.delete({
      where: { id }
    })
    revalidatePath("/mechanics")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to delete mechanic" }
  }
}

export async function getMechanics() {
    try {
        const mechanics = await prisma.mechanic.findMany({
            orderBy: { name: 'asc' }
        })
        return mechanics
    } catch (error) {
        console.error(error)
        return []
    }
}
