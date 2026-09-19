-- CreateTable
CREATE TABLE "reviewer_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "professional_title" TEXT,
    "specialty" TEXT,
    "qualifications" TEXT,
    "institution" TEXT,
    "bio" TEXT,
    "expertise" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviewer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reviewer_profiles_user_id_key" ON "reviewer_profiles"("user_id");

-- AddForeignKey
ALTER TABLE "reviewer_profiles" ADD CONSTRAINT "reviewer_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
