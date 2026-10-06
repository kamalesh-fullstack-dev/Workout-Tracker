-- AlterTable
ALTER TABLE "RoutineExercise" ADD COLUMN     "groupId" TEXT;

-- AlterTable
ALTER TABLE "RoutineExerciseSet" ADD COLUMN     "isDropSet" BOOLEAN NOT NULL DEFAULT false;
