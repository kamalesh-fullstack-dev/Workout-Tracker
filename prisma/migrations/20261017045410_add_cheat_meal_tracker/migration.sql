-- CreateEnum
CREATE TYPE "MealSlot" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING', 'NIGHT');

-- CreateTable
CREATE TABLE "CheatMeal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "slot" "MealSlot" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheatMeal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CheatMeal_userId_date_idx" ON "CheatMeal"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "CheatMeal_userId_date_slot_key" ON "CheatMeal"("userId", "date", "slot");

-- AddForeignKey
ALTER TABLE "CheatMeal" ADD CONSTRAINT "CheatMeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
