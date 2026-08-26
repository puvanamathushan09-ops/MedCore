/*
  Warnings:

  - You are about to drop the column `featured_image` on the `articles` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "topics_slug_key";

-- AlterTable
ALTER TABLE "articles" DROP COLUMN "featured_image",
ADD COLUMN     "featured_image_url" TEXT;

-- CreateIndex
CREATE INDEX "articles_topic_id_idx" ON "articles"("topic_id");

-- CreateIndex
CREATE INDEX "articles_created_at_idx" ON "articles"("created_at");
