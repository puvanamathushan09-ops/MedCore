-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "reviewer_applications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "professional_title" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "qualifications" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "bio" TEXT,
    "expertise" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "rejection_reason" TEXT,
    "reviewed_by_admin_id" UUID,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviewer_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reviewer_applications_status_idx" ON "reviewer_applications"("status");

-- CreateIndex
CREATE INDEX "reviewer_applications_user_id_idx" ON "reviewer_applications"("user_id");

-- AddForeignKey
ALTER TABLE "reviewer_applications"
ADD CONSTRAINT "reviewer_applications_reviewed_by_admin_id_fkey"
FOREIGN KEY ("reviewed_by_admin_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviewer_applications"
ADD CONSTRAINT "reviewer_applications_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;