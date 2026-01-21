"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createService(data: any) {
  try {
    const { 
        vehicleId, mechanicNotes, complaint, status, 
        odometer, serviceType, fuelLevel, serviceAdvisor,
        items, images,
        // Manual/Detailed entry fields
        regNumber, model, ownerName, ownerPhone,
        ownerAddress, ownerGstin, chassisNumber, engineNumber,
        estimatedDate
    } = data
    
    let finalVehicleId = vehicleId ? parseInt(vehicleId) : null

    // If no ID but Reg Number provided, find or create vehicle
    if (!finalVehicleId && regNumber) {
        const existingVehicle = await prisma.vehicle.findUnique({
            where: { regNumber: regNumber }
        })

        if (existingVehicle) {
            finalVehicleId = existingVehicle.id
            // Update vehicle details if provided (enrichment)
            await prisma.vehicle.update({
                where: { id: finalVehicleId },
                data: {
                    ownerName: ownerName || existingVehicle.ownerName,
                    ownerPhone: ownerPhone || existingVehicle.ownerPhone,
                    ownerAddress: ownerAddress || existingVehicle.ownerAddress,
                    ownerGstin: ownerGstin || existingVehicle.ownerGstin,
                    chassisNumber: chassisNumber || existingVehicle.chassisNumber,
                    engineNumber: engineNumber || existingVehicle.engineNumber,
                }
            })
        } else {
            // Create new vehicle
            const newVehicle = await prisma.vehicle.create({
                data: {
                    regNumber: regNumber.toUpperCase(),
                    model: model || "Unknown Model",
                    ownerName: ownerName || "Unknown Owner",
                    ownerPhone,
                    ownerAddress,
                    ownerGstin,
                    chassisNumber,
                    engineNumber,
                    type: "FOUR_WHEELER",
                }
            })
            finalVehicleId = newVehicle.id
        }
    } else if (finalVehicleId) {
        // Even if ID exists, update details if provided
         await prisma.vehicle.update({
            where: { id: finalVehicleId },
            data: {
                ownerPhone: ownerPhone || undefined, // undefined to avoid clearing if not passed
                ownerAddress: ownerAddress || undefined,
                ownerGstin: ownerGstin || undefined,
                chassisNumber: chassisNumber || undefined,
                engineNumber: engineNumber || undefined,
            }
        })
    }

    if (!finalVehicleId) {
        throw new Error("Vehicle Registration Number is required")
    }
    
    // Create the service record
    const service = await prisma.serviceRecord.create({
      data: {
        vehicleId: finalVehicleId,
        mechanicNotes,
        complaint,
        status,
        odometer: odometer ? parseInt(odometer) : null,
        serviceType,
        fuelLevel,
        serviceAdvisor,
        estimatedDate: estimatedDate ? new Date(estimatedDate) : null,
        images: images ? JSON.stringify(images) : null,
        customerSignature: data.customerSignature,
        advisorSignature: data.advisorSignature,
        totalCost: 0, // Will be calculated
      }
    })

    let totalCost = 0

    // Process items (parts and labor)
    if (items && items.length > 0) {
      for (const item of items) {
          let itemCost = 0
          
          // Helper to safely parse floats
          const p = (val: any) => parseFloat(val) || 0
          const pi = (val: any) => parseInt(val) || 0

          const qty = pi(item.quantity) || 1
          const unitPrice = p(item.unitPrice)
          
          // Detailed fields
          const hsnSac = item.hsnSac || ""
          const issueType = item.issueType || "Paid"
          const uom = item.uom || "Nos"
          
          const discountPercent = p(item.discountPercent)
          const discountAmount = p(item.discountAmount)
          
          const cgstPercent = p(item.cgstPercent)
          const cgstAmount = p(item.cgstAmount)
          const sgstPercent = p(item.sgstPercent)
          const sgstAmount = p(item.sgstAmount)
          const cessPercent = p(item.cessPercent)
          const cessAmount = p(item.cessAmount)

          // Calculate Cost: (Price * Qty) - Discount + Taxes
          // Note: The UI usually provides calculating values, but we can double check or rely on passed "amount" if specific.
          // For safety, let's trust the backend calculation if possible, or store what's passed.
          // Let's implement robust calculation here:
          const baseTotal = unitPrice * qty
          const taxableValue = baseTotal - discountAmount
          const totalTax = cgstAmount + sgstAmount + cessAmount
          itemCost = taxableValue + totalTax
          
          const commonData = {
              serviceRecordId: service.id,
              quantity: qty,
              description: item.description || "",
              unitPrice: unitPrice,
              hsnSac,
              issueType,
              uom,
              discountPercent,
              discountAmount,
              cgstPercent,
              cgstAmount,
              sgstPercent,
              sgstAmount,
              cessPercent,
              cessAmount,
              taxRate: cgstPercent + sgstPercent + cessPercent, // Aggregate for legacy view
              taxAmount: totalTax,
              discount: discountAmount, // Aggregate
              costAtTime: itemCost,
              vendorId: item.vendorId ? parseInt(item.vendorId) : null
          }

          if (item.itemType === 'PART' && item.partId) {
             const partId = parseInt(item.partId)
             // Check valid part
             const part = await prisma.part.findUnique({ where: { id: partId } })
             if (part) {
                 await prisma.servicePart.create({
                     data: {
                         ...commonData,
                         partId: part.id,
                         itemType: 'PART',
                         description: item.description || part.name, // Allow override
                     }
                 })
                 // Reduce stock
                 await prisma.part.update({
                    where: { id: part.id },
                    data: { stock: part.stock - qty }
                  })
             }
          } else {
              // Labor or Manual Part
              await prisma.servicePart.create({
                  data: {
                      ...commonData,
                      itemType: item.itemType || 'LABOR', 
                  }
              })
          }
          
          totalCost += itemCost
      }
    }

    // Update total cost
    await prisma.serviceRecord.update({
      where: { id: service.id },
      data: { totalCost }
    })

    // === JOB BOARD INTEGRATION ===
    // If submitToJobBoard is true, or if assignedApprover is set, create a JobBoard entry
    if (data.submitToJobBoard || data.assignedApprover) {
        // Check if job already exists (by partial match on jobNumber or logic)
        // For simplicity, we assume one job board entry per service record for now
        const jobNumber = `JOB-${service.id.toString().padStart(4, '0')}`
        
        // Find existing to avoid duplicates if re-submitting?
        // createJob handles "jobNumber" unique constraint, so we should use upsert or check
        const existingJob = await prisma.jobBoard.findUnique({ where: { jobNumber } })
        
        const jobData = {
            jobNumber,
            customerId: service.vehicleId ? (await prisma.vehicle.findUnique({where: {id: service.vehicleId}}))?.customerId : null,
            vehicleId: service.vehicleId,
            mechanicId: service.mechanicId,
            repairType: service.serviceType || "General",
            description: service.complaint || "No description",
            estimatedCost: totalCost,
            status: "PENDING", // Initial status for approval
            submittedBy: "Service Advisor", // Or fetch user
            assignedApprover: data.assignedApprover,
            priority: "MEDIUM",
            notes: "Auto-generated from Service Record"
        }

        if (existingJob) {
           await prisma.jobBoard.update({
             where: { id: existingJob.id },
             data: jobData
           })
        } else {
           await prisma.jobBoard.create({
             data: jobData
           })
        }
    }

    revalidatePath("/services")
    revalidatePath("/jobs") // Also revalidate jobs
    return { success: true, service }
  } catch (error) {
    console.error("Failed to create service:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to create service" }
  }
}

export async function updateService(id: number, data: any) {
    try {
        const { 
            mechanicNotes, complaint, status, 
            odometer, serviceType, fuelLevel, serviceAdvisor,
        estimatedDate,
            images,
            customerSignature,
            advisorSignature
        } = data
        
        await prisma.serviceRecord.update({
            where: { id },
            data: {
                mechanicNotes,
                complaint,
                status,
                odometer: odometer ? parseInt(odometer) : null,
                serviceType,
                fuelLevel,
                serviceAdvisor,
                estimatedDate: estimatedDate ? new Date(estimatedDate) : null,
                images: images ? JSON.stringify(images) : null,
                customerSignature,
                advisorSignature
            }
        })
        
        revalidatePath("/services")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update service" }
    }
}

export async function deleteService(id: number) {
    try {
        // First delete related service parts
        await prisma.servicePart.deleteMany({
            where: { serviceRecordId: id }
        })
        
        // Then delete the record
        await prisma.serviceRecord.delete({
            where: { id }
        })
        
        revalidatePath("/services")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete service" }
    }
}
