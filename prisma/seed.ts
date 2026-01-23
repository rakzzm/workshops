import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 1. Create Auth Users (Admin & Standard User)
  // Using plain text passwords to match POS app
  const admin = await prisma.user.upsert({
    where: { email: 'admin@meghcomm.store' },
    update: {},
    create: {
      email: 'admin@meghcomm.store',
      name: 'Workshop Admin',
      password: 'admin123456',  // Plain text
      role: 'ADMIN',
    },
  })
  console.log('Created Admin:', admin)

  const user = await prisma.user.upsert({
    where: { email: 'user@meghcomm.store' },
    update: {},
    create: {
      email: 'user@meghcomm.store',
      name: 'John Doe',
      password: 'user123456',  // Plain text
      role: 'USER',
    },
  })
  console.log('Created User:', user)

  // 2. Create Mechanics
  const specializations = ['Engine', 'Electrical', 'Body', 'Suspension', 'Paint']
  const mechanics = []
  for (let i = 1; i <= 5; i++) {
    const mech = await prisma.mechanic.upsert({
      where: { employeeId: `MECH00${i}` },
      update: {},
      create: {
        employeeId: `MECH00${i}`,
        name: `Mechanic ${i}`,
        specialization: specializations[i-1],
        hourlyRate: 400 + (i * 50),
        yearsExperience: i * 2,
        status: 'ACTIVE'
      }
    })
    mechanics.push(mech)
  }
  console.log(`Created ${mechanics.length} mechanics`)

  // 3. Create Customers
  const customers = []
  const customerNames = [
    { first: 'Amit', last: 'Sharma', phone: '9876543210' },
    { first: 'Priya', last: 'Patel', phone: '9876543211' },
    { first: 'Rahul', last: 'Verma', phone: '9876543212' },
    { first: 'Sneha', last: 'Reddy', phone: '9876543213' },
    { first: 'Vikram', last: 'Singh', phone: '9876543214' },
  ]

  for (let i = 0; i < customerNames.length; i++) {
    const c = await prisma.customer.upsert({
      where: { customerId: `CUST00${i+1}` },
      update: {},
      create: {
        customerId: `CUST00${i+1}`,
        firstName: customerNames[i].first,
        lastName: customerNames[i].last,
        phone: customerNames[i].phone,
        email: `${customerNames[i].first.toLowerCase()}@example.com`,
        address: `${100 + i}, MG Road, Bangalore`,
      }
    })
    customers.push(c)
  }
  console.log(`Created ${customers.length} customers`)

  // 4. Create Vehicles
  const vehicles = []
  const vehicleModels = [
    { reg: 'KA01MH1234', model: 'Maruti Swift', type: 'FOUR_WHEELER' },
    { reg: 'KA05JK5678', model: 'Honda Activa', type: 'TWO_WHEELER' },
    { reg: 'KA03PL9012', model: 'Hyundai Creta', type: 'FOUR_WHEELER' },
    { reg: 'KA02TR3456', model: 'Royal Enfield Classic', type: 'TWO_WHEELER' },
    { reg: 'KA04WE7890', model: 'Tata Nexon', type: 'FOUR_WHEELER' },
  ]

  for (let i = 0; i < vehicleModels.length; i++) {
    const v = await prisma.vehicle.upsert({
      where: { regNumber: vehicleModels[i].reg },
      update: {
          // Explicitly link first two vehicles to the standard user for "Owned Vehicles" demo
          ownerId: i < 2 ? user.id : null
      },
      create: {
        regNumber: vehicleModels[i].reg,
        model: vehicleModels[i].model,
        type: vehicleModels[i].type,
        ownerName: `${customers[i].firstName} ${customers[i].lastName}`,
        ownerPhone: customers[i].phone,
        customerId: customers[i].id,
        ownerId: i < 2 ? user.id : null // Link first two to John Doe
      }
    })
    vehicles.push(v)
  }
  console.log(`Created ${vehicles.length} vehicles (2 linked to User)`)

  // 5. Create Vendors
  // ... (unchanged)
  const vendors = []
  const vendorNames = ['AutoParts Express', 'Quick Fix Spares', 'Bharat Motors', 'Elite Components', 'Spark Solutions']
  for (let i = 0; i < vendorNames.length; i++) {
    const v = await prisma.vendor.upsert({
      where: { vendorId: `VEN00${i+1}` },
      update: {},
      create: {
        vendorId: `VEN00${i+1}`,
        companyName: vendorNames[i],
        phone: '1800555000' + i,
        status: 'ACTIVE',
        category: 'Parts',
      }
    })
    vendors.push(v)
  }
  console.log(`Created ${vendors.length} vendors`)

  // 6. Create Parts
  // ... (unchanged)
  const parts = []
  const partData = [
    { name: 'Engine Oil 5W-30', sku: 'OIL001', cat: 'Universal', price: 1200, stock: 50 },
    { name: 'Brake Pads Front', sku: 'BRK001', cat: 'FOUR_WHEELER', price: 2500, stock: 15 },
    { name: 'Air Filter', sku: 'AIR001', cat: 'FOUR_WHEELER', price: 450, stock: 30 },
    { name: 'Spark Plug', sku: 'SPK001', cat: 'TWO_WHEELER', price: 150, stock: 100 },
    { name: 'Oil Filter', sku: 'FLT001', cat: 'Universal', price: 300, stock: 8 }, // Low stock
    { name: 'Brake Shoe Rear', sku: 'BRK002', cat: 'TWO_WHEELER', price: 800, stock: 20 },
    { name: 'Battery 35AH', sku: 'BAT001', cat: 'FOUR_WHEELER', price: 4500, stock: 5 }, // Low stock
    { name: 'Coolant 1L', sku: 'CLT001', cat: 'FOUR_WHEELER', price: 350, stock: 40 },
    { name: 'Headlight Bulb H4', sku: 'LGT001', cat: 'Universal', price: 250, stock: 60 },
    { name: 'Wiper Blade Set', sku: 'WIP001', cat: 'FOUR_WHEELER', price: 750, stock: 25 },
  ]

  for (const p of partData) {
    const part = await prisma.part.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        name: p.name,
        sku: p.sku,
        category: p.cat,
        price: p.price,
        stock: p.stock,
        minStockLevel: 10
      }
    })
    parts.push(part)
  }
  console.log(`Created ${parts.length} parts`)

  // 7. Create JobBoard entries
  const repairTypes = ['General', 'Engine', 'Transmission', 'Brakes', 'Electrical']
  for (let i = 0; i < 10; i++) {
    const vIdx = i % vehicles.length
    const statusIdx = i % 5
    const statuses = ['PENDING', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED']
    const jobNum = `JOB-2026-${1000 + i}`
    
    await prisma.jobBoard.upsert({
      where: { jobNumber: jobNum },
      update: {},
      create: {
        jobNumber: jobNum,
        vehicleId: vehicles[vIdx].id,
        customerId: vehicles[vIdx].customerId,
        repairType: repairTypes[i % repairTypes.length],
        description: `Routine checkup and ${repairTypes[i % repairTypes.length].toLowerCase()} maintenance.`,
        status: statuses[statusIdx],
        priority: i % 3 === 0 ? 'HIGH' : 'MEDIUM',
        mechanicId: statusIdx > 1 ? mechanics[i % mechanics.length].id : null,
        estimatedCost: 2000 + (i * 500),
        finalCost: statusIdx === 3 ? 2200 + (i * 500) : null,
        submittedAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)),
        completedAt: statusIdx === 3 ? new Date() : null,
      }
    })
  }
  console.log('Created 10 JobBoard entries')

  // 8. Create Service Records (Completed History)
  const feedbackComments = [
    "Excellent service, the car feels brand new!",
    "Good job on the engine work, very professional.",
    "Prompt service and clear communication. Highly recommended.",
    "Decent service, but the turnaround time was a bit longer than expected.",
    "Very satisfied with the brake repair. Felt safe immediately.",
    "Friendly staff and transparent pricing.",
    "Fixed the issue I was struggling with for months!",
    "Quick oil change, in and out in 30 mins.",
    "Detailed inspection report was very helpful.",
    "A bit expensive, but quality work."
  ]

  const serviceTypes = [
    'Major Service', 'Minor Service', 'Oil Change', 'Brake Pad Replacement', 
    'Engine Diagnostics', 'Tire Rotation & Alignment', 'Battery Replacement',
    'Coolant Flush', 'General Inspection', 'Suspension Repair'
  ]

  for (let i = 0; i < 10; i++) {
    const vIdx = i % vehicles.length
    
    const exists = await prisma.serviceRecord.findFirst({
        where: { vehicleId: vehicles[vIdx].id, odometer: 15000 + (i * 2000) }
    })
    
    let serviceRecordId: number
    if (!exists) {
        const sr = await prisma.serviceRecord.create({
          data: {
            vehicleId: vehicles[vIdx].id,
            date: new Date(Date.now() - (i * 3 * 24 * 60 * 60 * 1000)), // Spread over last month
            status: 'COMPLETED',
            serviceType: serviceTypes[i % serviceTypes.length],
            totalCost: 1500 + (Math.random() * 5000), // Random cost between 1500 and 6500
            mechanicId: mechanics[i % mechanics.length].id,
            odometer: 15000 + (i * 2500),
            complaint: `Customer reported issue with ${serviceTypes[i % serviceTypes.length].toLowerCase().split(' ')[0]} system`,
            mechanicNotes: `Performed ${serviceTypes[i % serviceTypes.length]}. Check all fluids and safety components.`,
          }
        })
        serviceRecordId = sr.id

        // Add random parts to service record
        const partIdx = i % parts.length
        await prisma.servicePart.create({
          data: {
            serviceRecordId: sr.id,
            partId: parts[partIdx].id,
            quantity: 1 + Math.floor(Math.random() * 2),
            itemType: "PART",
            description: parts[partIdx].name,
            unitPrice: parts[partIdx].price,
            costAtTime: parts[partIdx].price,
            taxRate: 18,
            taxAmount: (parts[partIdx].price * 0.18),
            discount: 0
          }
        })
        
        // Add Labor charge as a service part item
        await prisma.servicePart.create({
          data: {
             serviceRecordId: sr.id,
             itemType: "LABOR",
             description: "Standard Labor Charges",
             unitPrice: 500 + (i * 50),
             quantity: 1,
             taxRate: 18,
             taxAmount: ((500 + (i * 50)) * 0.18),
             costAtTime: 500 + (i * 50)
          }
        })

    } else {
        serviceRecordId = exists.id
    }

    // Create Feedback for most records
    if (i < 8) { // 80% have feedback
        await prisma.feedback.upsert({
            where: { serviceRecordId: serviceRecordId },
            update: {},
            create: {
                serviceRecordId: serviceRecordId,
                rating: 3 + Math.floor(Math.random() * 3), // 3 to 5 stars
                comment: feedbackComments[i % feedbackComments.length],
                tags: JSON.stringify(['Quality', 'Timing', 'Value'].slice(0, 1 + (i % 3))),
                createdAt: new Date(Date.now() - (i * 2 * 24 * 60 * 60 * 1000))
            }
        })
    }
  }
  console.log('Created 10 Detailed Service records with Parts and Feedback')
  console.log('Created 5 Service records')

  // 10. Create Support Tickets (Feedback Menu)
  const ticketSubjects = [
    "Strange noise from engine", "Inquiry about latest bill", "AC not cooling", "Brake squealing", 
    "Oil leak detected", "Service delay complaint", "Appreciation for staff", "Parts availability check",
    "Warranty question", "Booking reschedule request"
  ]
  const ticketDescriptions = [
    "I hear a clicking sound when accelerating above 40km/h.",
    "The labor charges on my last service seem higher than the estimate provided.",
    "AC blows hot air after 10 mins of driving.",
    "Squealing noise from front right wheel when braking.",
    "Found oil drops on garage floor after parking.",
    "Car was promised yesterday but still not ready.",
    "Great service by the team, very professional.",
    "Do you have side mirrors for Swift 2022 in stock?",
    "Is my battery replacement covered under warranty?",
    "Need to move my appointment to next Tuesday."
  ]
  const ticketCategories = ['MECHANICAL', 'BILLING', 'MECHANICAL', 'MECHANICAL', 'MECHANICAL', 'SERVICE_QUALITY', 'SERVICE_QUALITY', 'INVENTORY', 'OTHER', 'OTHER']
  const ticketPriorities = ['HIGH', 'MEDIUM', 'MEDIUM', 'HIGH', 'CRITICAL', 'HIGH', 'LOW', 'MEDIUM', 'LOW', 'LOW']
  const ticketStatuses = ['OPEN', 'OPEN', 'INVESTIGATING', 'OPEN', 'CRITICAL', 'RESOLVED', 'RESOLVED', 'WAITING', 'OPEN', 'RESOLVED']
  
  for (let i = 0; i < 10; i++) {
    const vIdx = i % vehicles.length
    const ticketNum = `TKT-2026-${100 + i}`
    
    // Calculate dates based on status
    const isResolved = ticketStatuses[i] === 'RESOLVED';
    const createdDaysAgo = 10 - i;
    
    const ticket = await prisma.ticket.upsert({
      where: { ticketNumber: ticketNum },
      update: {},
      create: {
        ticketNumber: ticketNum,
        subject: ticketSubjects[i],
        description: ticketDescriptions[i],
        status: ticketStatuses[i],
        priority: ticketPriorities[i],
        category: ticketCategories[i],
        customerId: vehicles[vIdx].customerId,
        vehicleId: vehicles[vIdx].id,
        createdAt: new Date(Date.now() - (createdDaysAgo * 24 * 60 * 60 * 1000)),
        slaTargetDate: new Date(Date.now() + (24 * 60 * 60 * 1000)),
        resolvedAt: isResolved ? new Date() : null,
      }
    })

    // Add some messages to each ticket
    await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        sender: 'CUSTOMER',
        content: ticket.description,
        timestamp: new Date(Date.now() - (createdDaysAgo * 24 * 60 * 60 * 1000))
      }
    })

    if (i % 3 === 0) {
      await prisma.ticketMessage.create({
        data: {
          ticketId: ticket.id,
          sender: 'ADMIN',
          content: "Thank you for reaching out. We are looking into this and will get back to you shortly.",
          timestamp: new Date(Date.now() - ((createdDaysAgo - 1) * 24 * 60 * 60 * 1000))
        }
      })
    }

    if (isResolved) {
      await prisma.ticketMessage.create({
        data: {
          ticketId: ticket.id,
          sender: 'ADMIN',
          content: "The issue has been resolved. Please let us know if you need anything else.",
          timestamp: new Date()
        }
      })
    }
  }
  console.log('Created 10 Support Tickets with Messages')

  // 11. Create Purchase Orders
  for (let i = 0; i < 5; i++) {
    const vIdx = i % vendors.length
    const statuses = ['PENDING', 'ORDERED', 'RECEIVED']
    const items = [
      { name: parts[0].name, sku: parts[0].sku, quantity: 10, price: parts[0].price },
      { name: parts[1].name, sku: parts[1].sku, quantity: 5, price: parts[1].price },
    ]

    await prisma.purchaseOrder.create({
      data: {
        vendorId: vendors[vIdx].id,
        status: statuses[i % 3],
        date: new Date(Date.now() - (i * 2 * 24 * 60 * 60 * 1000)),
        items: JSON.stringify(items),
      }
    })
  }
  console.log('Created 5 Purchase orders')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
