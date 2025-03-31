-- CreateTable
CREATE TABLE "MangopayInfo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mangopayUserId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "kyc" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MangopayInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MangopayWallet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mangopayWalletId" TEXT NOT NULL,
    "mangopayInfoId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "balance" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MangopayWallet_mangopayInfoId_fkey" FOREIGN KEY ("mangopayInfoId") REFERENCES "MangopayInfo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "MangopayInfo_mangopayUserId_key" ON "MangopayInfo"("mangopayUserId");

-- CreateIndex
CREATE UNIQUE INDEX "MangopayInfo_userId_key" ON "MangopayInfo"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MangopayWallet_mangopayWalletId_key" ON "MangopayWallet"("mangopayWalletId");
