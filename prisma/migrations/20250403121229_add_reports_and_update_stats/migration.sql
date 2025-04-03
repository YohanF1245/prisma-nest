-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "totalIncome" REAL NOT NULL DEFAULT 0,
    "totalSales" INTEGER NOT NULL DEFAULT 0,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "pdfUrl" TEXT
);

-- CreateTable
CREATE TABLE "ReportStat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "salesStatId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReportStat_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReportStat_salesStatId_fkey" FOREIGN KEY ("salesStatId") REFERENCES "SalesStat" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SalesStat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statType" TEXT NOT NULL,
    "salesCount" INTEGER NOT NULL,
    "income" REAL NOT NULL DEFAULT 0,
    "contractId" TEXT NOT NULL,
    CONSTRAINT "SalesStat_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SalesStat" ("contractId", "createdAt", "id", "salesCount", "statType") SELECT "contractId", "createdAt", "id", "salesCount", "statType" FROM "SalesStat";
DROP TABLE "SalesStat";
ALTER TABLE "new_SalesStat" RENAME TO "SalesStat";
CREATE INDEX "SalesStat_contractId_statType_idx" ON "SalesStat"("contractId", "statType");
CREATE INDEX "SalesStat_createdAt_idx" ON "SalesStat"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ReportStat_reportId_salesStatId_key" ON "ReportStat"("reportId", "salesStatId");
