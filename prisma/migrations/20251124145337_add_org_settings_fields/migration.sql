-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "acceptedSenders" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "website" TEXT;
