"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createTicket(data: any) {
    const { subject, description, priority, category, customerId, vehicleId } = data
    
    // SLA Calculation
    let hoursToAdd = 24 // Default Medium
    switch (priority) {
        case 'CRITICAL': hoursToAdd = 4; break;
        case 'HIGH': hoursToAdd = 12; break;
        case 'MEDIUM': hoursToAdd = 24; break;
        case 'LOW': hoursToAdd = 48; break;
    }
    
    const slaTargetDate = new Date()
    slaTargetDate.setHours(slaTargetDate.getHours() + hoursToAdd)

    // Generate Ticket Number (Simple TKT-Timestamp)
    const ticketNumber = `TKT-${Date.now().toString().slice(-6)}`

    await prisma.ticket.create({
        data: {
            ticketNumber,
            subject,
            description,
            priority,
            category,
            slaTargetDate,
            customerId: customerId ? parseInt(customerId) : null,
            vehicleId: vehicleId ? parseInt(vehicleId) : null,
            messages: {
                create: {
                    sender: 'SYSTEM',
                    content: `Ticket created with ${priority} priority. SLA Target: ${slaTargetDate.toLocaleString()}`
                }
            }
        }
    })

    revalidatePath('/feedback')
    return { success: true }
}

export async function getTickets() {
    return await prisma.ticket.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            customer: true,
            vehicle: true
        }
    })
}

export async function getTicketDetails(id: number) {
    return await prisma.ticket.findUnique({
        where: { id },
        include: {
            customer: true,
            vehicle: true,
            messages: {
                orderBy: { timestamp: 'asc' }
            }
        }
    })
}

export async function addMessage(ticketId: number, content: string, sender: string) {
    await prisma.ticketMessage.create({
        data: {
            ticketId,
            content,
            sender
        }
    })
    revalidatePath('/feedback')
}

export async function updateTicketStatus(id: number, status: string) {
    await prisma.ticket.update({
        where: { id },
        data: { 
            status,
            resolvedAt: status === 'RESOLVED' ? new Date() : null
        }
    })
    
    // Add system message
    await prisma.ticketMessage.create({
        data: {
            ticketId: id,
            content: `Status updated to ${status}`,
            sender: 'SYSTEM'
        }
    })

    revalidatePath('/feedback')
}
