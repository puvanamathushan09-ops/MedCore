/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `topics` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "topics_slug_key" ON "topics"("slug");
