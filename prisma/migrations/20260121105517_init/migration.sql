/*
  Warnings:

  - Added the required column `unitPrice` to the `ServicePart` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Part" ADD COLUMN "compatibility" TEXT;
ALTER TABLE "Part" ADD COLUMN "imageUrl" TEXT;
ALTER TABLE "Part" ADD COLUMN "system" TEXT;

-- CreateTable
CREATE TABLE "Customer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "gstin" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Mechanic" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "specialization" TEXT,
    "department" TEXT,
    "yearsExperience" INTEGER NOT NULL DEFAULT 0,
    "hourlyRate" REAL NOT NULL DEFAULT 0,
    "certifications" TEXT,
    "skills" TEXT,
    "performanceRating" REAL NOT NULL DEFAULT 3.5,
    "availability" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "shift" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "emergencyContact" TEXT,
    "notes" TEXT,
    "hireDate" DATETIME,
    "joinedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vendorId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactPerson" TEXT,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "gstin" TEXT,
    "pan" TEXT,
    "category" TEXT,
    "rating" REAL NOT NULL DEFAULT 3.0,
    "paymentTerms" TEXT,
    "creditLimit" REAL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "totalPurchases" REAL NOT NULL DEFAULT 0,
    "lastPurchaseDate" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "JobBoard" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "jobNumber" TEXT NOT NULL,
    "customerId" INTEGER,
    "vehicleId" INTEGER,
    "repairType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "estimatedCost" REAL,
    "finalCost" REAL,
    "mechanicId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "submittedBy" TEXT,
    "approvedBy" TEXT,
    "assignedApprover" TEXT,
    "rejectedBy" TEXT,
    "rejectionReason" TEXT,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" DATETIME,
    "rejectedAt" DATETIME,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "JobBoard_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "JobBoard_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "JobBoard_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "Mechanic" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StoreSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shopName" TEXT NOT NULL DEFAULT 'My Shop',
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "logoUrl" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "phone" TEXT,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ticketNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "slaTargetDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "resolvedAt" DATETIME,
    "customerId" INTEGER,
    "vehicleId" INTEGER,
    CONSTRAINT "Ticket_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Ticket_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TicketMessage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ticketId" INTEGER NOT NULL,
    "sender" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TicketMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "serviceRecordId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Feedback_serviceRecordId_fkey" FOREIGN KEY ("serviceRecordId") REFERENCES "ServiceRecord" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SLAConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "priority" TEXT NOT NULL,
    "responseTimeHours" INTEGER NOT NULL,
    "resolutionTimeHours" INTEGER NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PurchaseOrder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "items" TEXT,
    "vendorId" INTEGER,
    CONSTRAINT "PurchaseOrder_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PurchaseOrder" ("date", "id", "items", "status") SELECT "date", "id", "items", "status" FROM "PurchaseOrder";
DROP TABLE "PurchaseOrder";
ALTER TABLE "new_PurchaseOrder" RENAME TO "PurchaseOrder";
CREATE TABLE "new_ServicePart" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "serviceRecordId" INTEGER NOT NULL,
    "partId" INTEGER,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "itemType" TEXT NOT NULL DEFAULT 'PART',
    "description" TEXT,
    "unitPrice" REAL NOT NULL,
    "taxRate" REAL NOT NULL DEFAULT 0,
    "taxAmount" REAL NOT NULL DEFAULT 0,
    "discount" REAL NOT NULL DEFAULT 0,
    "hsnSac" TEXT,
    "issueType" TEXT,
    "uom" TEXT,
    "discountPercent" REAL NOT NULL DEFAULT 0,
    "discountAmount" REAL NOT NULL DEFAULT 0,
    "cgstPercent" REAL NOT NULL DEFAULT 0,
    "cgstAmount" REAL NOT NULL DEFAULT 0,
    "sgstPercent" REAL NOT NULL DEFAULT 0,
    "sgstAmount" REAL NOT NULL DEFAULT 0,
    "cessPercent" REAL NOT NULL DEFAULT 0,
    "cessAmount" REAL NOT NULL DEFAULT 0,
    "costAtTime" REAL NOT NULL,
    "vendorId" INTEGER,
    CONSTRAINT "ServicePart_serviceRecordId_fkey" FOREIGN KEY ("serviceRecordId") REFERENCES "ServiceRecord" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ServicePart_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ServicePart_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ServicePart" ("costAtTime", "id", "partId", "quantity", "serviceRecordId") SELECT "costAtTime", "id", "partId", "quantity", "serviceRecordId" FROM "ServicePart";
DROP TABLE "ServicePart";
ALTER TABLE "new_ServicePart" RENAME TO "ServicePart";
CREATE TABLE "new_ServiceRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vehicleId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "mechanicNotes" TEXT,
    "complaint" TEXT,
    "totalCost" REAL NOT NULL DEFAULT 0,
    "odometer" INTEGER,
    "serviceType" TEXT,
    "fuelLevel" TEXT,
    "serviceAdvisor" TEXT,
    "estimatedDate" DATETIME,
    "nextServiceDate" DATETIME,
    "images" TEXT,
    "customerSignature" TEXT,
    "advisorSignature" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "mechanicId" INTEGER,
    CONSTRAINT "ServiceRecord_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ServiceRecord_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "Mechanic" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ServiceRecord" ("complaint", "createdAt", "date", "id", "mechanicNotes", "status", "totalCost", "updatedAt", "vehicleId") SELECT "complaint", "createdAt", "date", "id", "mechanicNotes", "status", "totalCost", "updatedAt", "vehicleId" FROM "ServiceRecord";
DROP TABLE "ServiceRecord";
ALTER TABLE "new_ServiceRecord" RENAME TO "ServiceRecord";
CREATE TABLE "new_Vehicle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "regNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "chassisNumber" TEXT,
    "engineNumber" TEXT,
    "ownerPhone" TEXT,
    "ownerAddress" TEXT,
    "ownerGstin" TEXT,
    "customerId" INTEGER,
    "ownerId" TEXT,
    CONSTRAINT "Vehicle_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Vehicle_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Vehicle" ("createdAt", "id", "model", "ownerName", "regNumber", "type", "updatedAt") SELECT "createdAt", "id", "model", "ownerName", "regNumber", "type", "updatedAt" FROM "Vehicle";
DROP TABLE "Vehicle";
ALTER TABLE "new_Vehicle" RENAME TO "Vehicle";
CREATE UNIQUE INDEX "Vehicle_regNumber_key" ON "Vehicle"("regNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_customerId_key" ON "Customer"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Mechanic_employeeId_key" ON "Mechanic"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_vendorId_key" ON "Vendor"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "JobBoard_jobNumber_key" ON "JobBoard"("jobNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_ticketNumber_key" ON "Ticket"("ticketNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_serviceRecordId_key" ON "Feedback"("serviceRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "SLAConfig_priority_key" ON "SLAConfig"("priority");
