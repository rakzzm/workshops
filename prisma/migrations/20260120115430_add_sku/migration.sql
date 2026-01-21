/*
  Warnings:

  - Added the required column `sku` to the `Part` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Part" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "price" REAL NOT NULL,
    "minStockLevel" INTEGER NOT NULL DEFAULT 5
);
INSERT INTO "new_Part" ("category", "id", "minStockLevel", "name", "price", "stock") SELECT "category", "id", "minStockLevel", "name", "price", "stock" FROM "Part";
DROP TABLE "Part";
ALTER TABLE "new_Part" RENAME TO "Part";
CREATE UNIQUE INDEX "Part_sku_key" ON "Part"("sku");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
