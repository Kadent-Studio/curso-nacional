-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "checkInsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "firstCheckInAt" TIMESTAMP(3),
ADD COLUMN     "lastCheckInAt" TIMESTAMP(3);
