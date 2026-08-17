-- CreateEnum
CREATE TYPE "VendorStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING');

-- AlterTable
ALTER TABLE "VendorProfile" ADD COLUMN     "status" "VendorStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "VendorProfile_status_idx" ON "VendorProfile"("status");
