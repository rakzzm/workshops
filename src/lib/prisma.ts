import { PrismaClient } from '@prisma/client'

// Simple Prisma client - throws errors (database will fail on Vercel)
const client = new PrismaClient()

export { client as prisma }
export default client
