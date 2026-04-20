-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'CLOSED');

-- AlterTable
ALTER TABLE "apartments" ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "projectId" INTEGER,
ADD COLUMN     "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "imageUrl" TEXT NOT NULL DEFAULT 'https://via.placeholder.com/800x600?text=Project+Image',
ADD COLUMN     "videoUrl" TEXT;

-- CreateIndex
CREATE INDEX "apartments_projectId_idx" ON "apartments"("projectId");

-- CreateIndex
CREATE INDEX "leads_projectId_idx" ON "leads"("projectId");

-- CreateIndex
CREATE INDEX "leads_status_idx" ON "leads"("status");

-- CreateIndex
CREATE INDEX "leads_apartmentId_idx" ON "leads"("apartmentId");

-- CreateIndex
CREATE INDEX "projects_developerId_idx" ON "projects"("developerId");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
