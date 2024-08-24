-- CreateTable
CREATE TABLE "Campus" (
    "campus_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "acronym" TEXT NOT NULL,

    CONSTRAINT "Campus_pkey" PRIMARY KEY ("campus_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Campus_campus_id_key" ON "Campus"("campus_id");

-- CreateIndex
CREATE UNIQUE INDEX "Campus_name_key" ON "Campus"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Campus_acronym_key" ON "Campus"("acronym");
