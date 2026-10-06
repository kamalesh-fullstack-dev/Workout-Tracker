-- AlterTable
ALTER TABLE "SessionExercise" ADD COLUMN     "groupId" TEXT;

-- AlterTable
ALTER TABLE "SetEntry" ADD COLUMN     "isDropSet" BOOLEAN NOT NULL DEFAULT false;
