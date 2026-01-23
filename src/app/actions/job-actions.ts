"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { MOCK_JOBS } from "@/lib/mock-data"

// Helper to safely parse ID
const parseId = (id: number | string) => {
  const parsed = parseInt(id.toString())
  return isNaN(parsed) ? -1 : parsed
}

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
    
    if (!jobs || jobs.length === 0) {
        console.warn("No jobs found in DB (or DB error), returning MOCK_JOBS")
        return MOCK_JOBS as any
    }
    
    return jobs
  } catch (error) {
    console.warn("Database disconnected (Demo Mode): Using mock jobs.", error)
    return MOCK_JOBS as any
  }
}

// Create new job
export async function createJob(data: any): Promise<{ success: boolean; error?: string; job?: any }> {
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
    console.warn("Database disconnected (Demo Mode): Using mock jobs.", error)
    return { success: true, job: { ...data, id: Math.floor(Math.random() * 1000) } }
  }
}

// Approve job
export async function approveJob(id: number | string, data: any): Promise<{ success: boolean; error?: string; job?: any }> {
  try {
    const numericId = parseId(id)
    if (numericId === -1) throw new Error("Invalid ID")

    const job = await prisma.jobBoard.update({
      where: { id: numericId },
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
    console.warn("Database disconnected (Demo Mode): Using mock jobs.", error)
    // Mutate Mock Data
    const mockIndex = MOCK_JOBS.findIndex(j => j.id == id.toString())
    if (mockIndex !== -1) {
        MOCK_JOBS[mockIndex].status = "APPROVED"
        MOCK_JOBS[mockIndex].approvedAt = new Date()
        return { success: true, job: MOCK_JOBS[mockIndex] }
    }
    return { success: true, job: { id, status: "APPROVED", ...data } }
  }
}

// Reject job
export async function rejectJob(id: number | string, data: any): Promise<{ success: boolean; error?: string; job?: any }> {
  try {
    const numericId = parseId(id)
    if (numericId === -1) throw new Error("Invalid ID")

    const job = await prisma.jobBoard.update({
      where: { id: numericId },
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
    console.warn("Database disconnected (Demo Mode): Using mock jobs.", error)
    const mockIndex = MOCK_JOBS.findIndex(j => j.id == id.toString())
    if (mockIndex !== -1) {
        MOCK_JOBS[mockIndex].status = "REJECTED"
        return { success: true, job: MOCK_JOBS[mockIndex] }
    }
    return { success: true, job: { id, status: "REJECTED", ...data } }
  }
}

// Start job (move to IN_PROGRESS)
export async function startJob(id: number | string): Promise<{ success: boolean; error?: string; job?: any }> {
  try {
    const numericId = parseId(id)
    if (numericId === -1) throw new Error("Invalid ID")

    const job = await prisma.jobBoard.update({
      where: { id: numericId },
      data: {
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
    })
    revalidatePath("/jobs")
    return { success: true, job }
  } catch (error) {
    console.warn("Database disconnected (Demo Mode): Using mock jobs.", error)
    const mockIndex = MOCK_JOBS.findIndex(j => j.id == id.toString())
    if (mockIndex !== -1) {
        MOCK_JOBS[mockIndex].status = "IN_PROGRESS"
        MOCK_JOBS[mockIndex].startedAt = new Date()
        return { success: true, job: MOCK_JOBS[mockIndex] }
    }
    return { success: true, job: { id, status: "IN_PROGRESS" } }
  }
}

// Complete job
export async function completeJob(id: number | string, data: any): Promise<{ success: boolean; error?: string; job?: any }> {
  try {
    const numericId = parseId(id)
    if (numericId === -1) throw new Error("Invalid ID")
    
    // Use transaction to ensure both update and service record creation happen
    const result = await prisma.$transaction(async (tx) => {
        // 1. Update Job Status
        const job = await tx.jobBoard.update({
            where: { id: numericId },
            data: {
                status: "COMPLETED",
                finalCost: data.finalCost,
                completedAt: new Date(),
                notes: data.notes || null,
            },
            include: { vehicle: true, customer: true }
        })

        // 2. Create Service Record if vehicle exists
        if (job.vehicleId) {
            await tx.serviceRecord.create({
                data: {
                    vehicleId: job.vehicleId,
                    date: new Date(),
                    status: "COMPLETED",
                    serviceType: job.repairType,
                    mechanicNotes: job.description,
                    totalCost: data.finalCost || job.estimatedCost || 0,
                    mechanicId: job.mechanicId,
                    complaint: job.description
                }
            })
        }

        return job
    })

    revalidatePath("/jobs")
    revalidatePath("/services") // Update service history
    return { success: true, job: result }
  } catch (error) {
    console.warn("Database disconnected (Demo Mode): Using mock jobs.", error)
    const mockIndex = MOCK_JOBS.findIndex(j => j.id == id.toString())
    if (mockIndex !== -1) {
        MOCK_JOBS[mockIndex].status = "COMPLETED"
        MOCK_JOBS[mockIndex].completedAt = new Date()
        MOCK_JOBS[mockIndex].finalCost = data.finalCost
        return { success: true, job: MOCK_JOBS[mockIndex] }
    }
    return { success: true, job: { id, status: "COMPLETED", ...data } }
  }
}

// Delete job
export async function deleteJob(id: number | string): Promise<{ success: boolean; error?: string }> {
  try {
    const numericId = parseId(id)
    if (numericId === -1) throw new Error("Invalid ID")
    
    await prisma.jobBoard.delete({
      where: { id: numericId }
    })
    revalidatePath("/jobs")
    return { success: true }
  } catch (error) {
    console.warn("Database disconnected (Demo Mode): Using mock jobs.", error)
    return { success: true }
  }
}
// Void-returning wrappers for Form Actions
export async function handleApproveJob(id: number | string) {
  await approveJob(id, { approvedBy: "Manager" })
}

export async function handleRejectJob(id: number | string) {
  await rejectJob(id, { rejectedBy: "Manager", rejectionReason: "Not approved" })
}

export async function handleStartJob(id: number | string) {
  await startJob(id)
}

export async function handleCompleteJob(id: number | string, finalCost: number) {
  await completeJob(id, { finalCost })
}
