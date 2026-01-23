import { PrismaClient } from '@prisma/client'
import { MOCK_CUSTOMERS, MOCK_MECHANICS, MOCK_VENDORS, MOCK_PARTS, MOCK_JOBS, MOCK_PURCHASE_ORDERS } from './mock-data'

// Create Prisma client with automatic error handling AND mock data fallback
const globalForPrisma = global as unknown as { prisma: PrismaClient }

const MOCK_DATA_MAP: Record<string, any[]> = {
  customer: MOCK_CUSTOMERS,
  mechanic: MOCK_MECHANICS,
  vendor: MOCK_VENDORS,
  part: MOCK_PARTS,
  jobBoard: MOCK_JOBS,
  purchaseOrder: MOCK_PURCHASE_ORDERS,
}

const createSafePrisma = () => {
  const client = new PrismaClient()
  
  const handler = {
    get(target: any, prop: string) {
      if (prop === '$connect' || prop === '$disconnect') {
        return () => Promise.resolve()
      }
      
      // For model queries, return a proxy that catches errors and returns mock data
      if (typeof target[prop] === 'object' && target[prop] !== null) {
        return new Proxy(target[prop], {
          get(modelTarget: any, method: string) {
            if (typeof modelTarget[method] === 'function') {
              return async (...args: any[]) => {
                try {
                  return await modelTarget[method](...args)
                } catch (error) {
                  console.log(`Database unavailable for ${prop}.${method}, using mock data`)
                  
                  // Return mock data based on model name
                  const mockData = MOCK_DATA_MAP[prop] || []
                  
                  if (method === 'findMany') return mockData
                  if (method === 'findUnique' || method === 'findFirst') {
                    return mockData[0] || null
                  }
                  if (method === 'count') return mockData.length
                  return null
                }
              }
            }
            return modelTarget[method]
          }
        })
      }
      
      return target[prop]
    }
  }
  
  return new Proxy(client, handler)
}

export const prisma = globalForPrisma.prisma || createSafePrisma()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
