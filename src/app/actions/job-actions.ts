"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Get all jobs with related data
export async function getJobs() {
  try {
    const jobs = await prisma.jobBoard.findMany({
      orderBy: { submittedAt: 'desc' },
      include: {
        customer: true,
        vehicle: true,
        mechanic: true,
      }
    })
    return jobs
  } catch (error) {
    console.error(error)
    return []
  }
}

// Create new job
export async function createJob(data: any) {
  try {
    const job = await prisma.jobBoard.create({
      data: {
        jobNumber: data.jobNumber,
        customerId: data.customerId || null,
        vehicleId: data.vehicleId || null,
        repairType: data.repairType,
        description: data.description,
        priority: data.priority || "MEDIUM",
        submittedBy: data.submittedBy || "System",
        notes: data.notes || null,
      },
    })
    revalidatePath("/jobs")
    return { success: true, job }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to create job" }
  }
}

// Approve job
export async function approveJob(id: number, data: any) {
  try {
    const job = await prisma.jobBoard.update({
      where: { id },
      data: {
        status: "APPROVED",
        mechanicId: data.mechanicId || null,
        estimatedCost: data.estimatedCost || null,
        approvedBy: data.approvedBy || "Manager",
        approvedAt: new Date(),
        notes: data.notes || null,
      },
    })
    revalidatePath("/jobs")
    return { success: true, job }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to approve job" }
  }
}

// Reject job
export async function rejectJob(id: number, data: any) {
  try {
    const job = await prisma.jobBoard.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectedBy: data.rejectedBy || "Manager",
        rejectionReason: data.rejectionReason,
        rejectedAt: new Date(),
      },
    })
    revalidatePath("/jobs")
    return { success: true, job }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to reject job" }
  }
}

// Start job (move to IN_PROGRESS)
export async function startJob(id: number) {
  try {
    const job = await prisma.jobBoard.update({
      where: { id },
      data: {
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
    })
    revalidatePath("/jobs")
    return { success: true, job }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to start job" }
  }
}

// Complete job
export async function completeJob(id: number, data: any) {
  try {
    const job = await prisma.jobBoard.update({
      where: { id },
      data: {
        status: "COMPLETED",
        finalCost: data.finalCost,
        completedAt: new Date(),
        notes: data.notes || null,
      },
    })
    revalidatePath("/jobs")
    return { success: true, job }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to complete job" }
  }
}

// Delete job
export async function deleteJob(id: number) {
  try {
    await prisma.jobBoard.delete({
      where: { id }
    })
    revalidatePath("/jobs")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to delete job" }
  }
}
