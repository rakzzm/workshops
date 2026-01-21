"use server"

import prisma from "@/lib/prisma"

export async function searchParts(query: string) {
  try {
    if (!query || query.length < 2) return []

    const parts = await prisma.part.findMany({
      where: {
        OR: [
          { name: { contains: query } }, // Case insensitive by default in SQLite often, but let's assume standard behavior
          { sku: { contains: query } },
          { system: { contains: query } }
        ]
      },
      take: 20
    })
    return parts
  } catch (error) {
    console.error("Search Parts Error:", error)
    return []
  }
}

export async function getPartsList() {
    try {
        const parts = await prisma.part.findMany({
            orderBy: { name: 'asc' },
            take: 100 // Limit for dropdowns if used directly
        })
        return parts
    } catch {
        return []
    }
}
