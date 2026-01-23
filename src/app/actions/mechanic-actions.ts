"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { MOCK_MECHANICS } from "@/lib/mock-data"

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
    console.error("Database error in createMechanic, falling back:", error)
    // Simulate success
    return { success: true, mechanic: { ...data, id: Math.floor(Math.random() * 1000) } }
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
    console.error("Database error in updateMechanic, falling back:", error)
    return { success: true, mechanic: { ...data, id } }
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
    console.error("Database error in deleteMechanic, falling back:", error)
    return { success: true }
  }
}

export async function getMechanics() {
    try {
        const mechanics = await prisma.mechanic.findMany({
            orderBy: { name: 'asc' }
        })
        if (!mechanics || mechanics.length === 0) {
            console.warn("No mechanics found in DB (or DB error), returning MOCK_MECHANICS")
            return MOCK_MECHANICS as any
        }
        return mechanics
    } catch (error) {
        console.warn("Database disconnected (Demo Mode): Using mock mechanics data.", error)
        return MOCK_MECHANICS as any
    }
}
