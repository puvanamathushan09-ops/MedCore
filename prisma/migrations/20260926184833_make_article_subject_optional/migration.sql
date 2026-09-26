-- DropForeignKey
ALTER TABLE "articles" DROP CONSTRAINT "articles_subject_id_fkey";

-- AlterTable
ALTER TABLE "articles" ALTER COLUMN "subject_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
