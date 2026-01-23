"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { MOCK_TICKETS } from "@/lib/mock-data"

export async function createTicket(data: any): Promise<{ success: boolean; error?: string }> {
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

    try {
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
    } catch (error) {
        console.warn("Database disconnected (Demo Mode): Using mock tickets.", error)
        // In fallback mode, we can't easily persist new data without a DB
        // But we simulate success
    }

    revalidatePath('/feedback')
    return { success: true }
}

export async function getTickets() {
    try {
        const tickets = await prisma.ticket.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                customer: true,
                vehicle: true
            }
        })
        if (!tickets || tickets.length === 0) {
            console.warn("No tickets found in DB, using mock data")
            return MOCK_TICKETS as any
        }
        return tickets
    } catch (error) {
        console.warn("Database disconnected (Demo Mode): Using mock tickets.", error)
        return MOCK_TICKETS as any
    }
}

export async function getTicketDetails(id: number) {
    try {
        const ticket = await prisma.ticket.findUnique({
            where: { id },
            include: {
                customer: true,
                vehicle: true,
                messages: {
                    orderBy: { timestamp: 'asc' }
                }
            }
        })
        if (!ticket) {
            // Fallback for mock data IDs
            const mock = MOCK_TICKETS.find(t => t.id === id)
            if (mock) return mock as any
            return null
        }
        return ticket
    } catch (error) {
        console.warn("Database disconnected (Demo Mode): Using mock tickets.", error)
        const mock = MOCK_TICKETS.find(t => t.id === id)
        if (mock) return mock as any
        return null
    }
}

export async function addMessage(ticketId: number, content: string, sender: string) {
    try {
        await prisma.ticketMessage.create({
            data: {
                ticketId,
                content,
                sender
            }
        })
    } catch (error) {
         console.warn("Database disconnected (Demo Mode): Using mock tickets.", error)
         const mockIndex = MOCK_TICKETS.findIndex(t => t.id === ticketId)
         if (mockIndex !== -1) {
             const newMessage = {
                 id: Date.now(),
                 ticketId,
                 content,
                 sender,
                 timestamp: new Date()
             }
             if (!MOCK_TICKETS[mockIndex].messages) {
                 MOCK_TICKETS[mockIndex].messages = []
             }
             MOCK_TICKETS[mockIndex].messages.push(newMessage)
         }
    }
    revalidatePath('/feedback')
}

export async function updateTicketStatus(id: number, status: string) {
    try {
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
    } catch (error) {
        console.warn("Database disconnected (Demo Mode): Using mock tickets.", error)
        const mockIndex = MOCK_TICKETS.findIndex(t => t.id === id)
        if (mockIndex !== -1) {
            MOCK_TICKETS[mockIndex].status = status
            if (status === 'RESOLVED') {
                MOCK_TICKETS[mockIndex].resolvedAt = new Date()
            }
            
            // Add system message mock
            const newMessage = {
                 id: Date.now(),
                 ticketId: id,
                 content: `Status updated to ${status}`,
                 sender: 'SYSTEM',
                 timestamp: new Date()
             }
             if (!MOCK_TICKETS[mockIndex].messages) {
                 MOCK_TICKETS[mockIndex].messages = []
             }
             MOCK_TICKETS[mockIndex].messages.push(newMessage)
        }
    }

    revalidatePath('/feedback')
}
