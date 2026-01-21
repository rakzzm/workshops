"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/auth"

export async function getServiceHistory() {
    const session = await auth()
    if (!session || !session.user) {
        return []
    }

    const where: any = {}
    
    // RBAC: If not ADMIN, only show own vehicles
    if (session.user.role !== 'ADMIN') {
        where.vehicle = {
            ownerId: session.user.id
        }
    }

    return await prisma.serviceRecord.findMany({
        where,
        include: {
            vehicle: true,
            mechanic: true,
            parts: true
        },
        orderBy: {
            date: 'desc'
        }
    })
}
