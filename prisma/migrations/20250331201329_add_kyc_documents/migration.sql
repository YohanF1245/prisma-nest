-- CreateTable
CREATE TABLE "KycDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mangopayDocumentId" TEXT NOT NULL,
    "mangopayInfoId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "refusalReason" TEXT,
    "refusalReasonMessage" TEXT,
    "fileName" TEXT,
    "fileUrl" TEXT,
    "pages" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "KycDocument_mangopayInfoId_fkey" FOREIGN KEY ("mangopayInfoId") REFERENCES "MangopayInfo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KycDocumentPage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kycDocumentId" TEXT NOT NULL,
    "mangopayPageId" TEXT,
    "fileUrl" TEXT,
    "pageNumber" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "KycDocumentPage_kycDocumentId_fkey" FOREIGN KEY ("kycDocumentId") REFERENCES "KycDocument" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "KycDocument_mangopayDocumentId_key" ON "KycDocument"("mangopayDocumentId");
