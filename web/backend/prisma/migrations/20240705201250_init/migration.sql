/*
  Warnings:

  - You are about to drop the column `globalSettings` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `leadTime` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `zipCodes` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the `Orders` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `currencyFormats` to the `ShopData` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Orders" DROP CONSTRAINT "Orders_storeId_fkey";

-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "globalSettings",
DROP COLUMN "leadTime",
DROP COLUMN "zipCodes";

-- AlterTable
ALTER TABLE "ShopData" ADD COLUMN     "currencyFormats" JSONB NOT NULL;

-- DropTable
DROP TABLE "Orders";
