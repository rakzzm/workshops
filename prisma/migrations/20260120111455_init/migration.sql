-- CreateTable
CREATE TABLE "Vehicle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "regNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ServiceRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vehicleId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "mechanicNotes" TEXT,
    "complaint" TEXT,
    "totalCost" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ServiceRecord_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Part" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "price" REAL NOT NULL,
    "minStockLevel" INTEGER NOT NULL DEFAULT 5
);

-- CreateTable
CREATE TABLE "ServicePart" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "serviceRecordId" INTEGER NOT NULL,
    "partId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "costAtTime" REAL NOT NULL,
    CONSTRAINT "ServicePart_serviceRecordId_fkey" FOREIGN KEY ("serviceRecordId") REFERENCES "ServiceRecord" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ServicePart_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "items" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_regNumber_key" ON "Vehicle"("regNumber");
