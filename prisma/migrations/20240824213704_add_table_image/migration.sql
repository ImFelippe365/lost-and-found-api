-- CreateTable
CREATE TABLE "Image" (
    "campus_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "filetype" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "size" INTEGER NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("campus_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Image_campus_id_key" ON "Image"("campus_id");
