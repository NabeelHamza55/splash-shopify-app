-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('TRIAL', 'PAID');

-- CreateTable
CREATE TABLE "Shop" (
    "shop" TEXT NOT NULL,
    "scopes" TEXT,
    "isInstalled" BOOLEAN NOT NULL,
    "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uninstalledAt" TIMESTAMP(3),
    "installCount" INTEGER NOT NULL DEFAULT 0,
    "subscribeCount" INTEGER NOT NULL DEFAULT 0,
    "showOnboarding" BOOLEAN NOT NULL DEFAULT true,
    "test" BOOLEAN NOT NULL DEFAULT false,
    "settings" JSONB,

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("shop")
);

-- CreateTable
CREATE TABLE "ShopData" (
    "shop" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "primaryDomain" JSONB NOT NULL,
    "plan" JSONB NOT NULL,
    "billingAddress" JSONB NOT NULL,
    "ianaTimezone" TEXT NOT NULL,

    CONSTRAINT "ShopData_pkey" PRIMARY KEY ("shop")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "shop" TEXT NOT NULL,
    "plan" "Plan" NOT NULL DEFAULT 'TRIAL',
    "planSlug" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "test" BOOLEAN NOT NULL DEFAULT false,
    "trialDays" INTEGER NOT NULL DEFAULT 14,
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "upgradedAt" TIMESTAMP(3),
    "chargeId" TEXT,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("shop")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "session" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "displaySettings" JSONB NOT NULL,
    "globalSettings" JSONB NOT NULL,
    "leadTime" JSONB NOT NULL,
    "zipCodes" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orders" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "orderId" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "deliveryDate" TEXT NOT NULL,
    "deliveryTime" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "fulfilmentStatus" TEXT NOT NULL,
    "deliveryMethod" TEXT NOT NULL,
    "items" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Shop_shop_key" ON "Shop"("shop");

-- CreateIndex
CREATE INDEX "Shop_shop_idx" ON "Shop"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "ShopData_shop_key" ON "ShopData"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "ShopData_id_key" ON "ShopData"("id");

-- CreateIndex
CREATE INDEX "ShopData_shop_idx" ON "ShopData"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_shop_key" ON "Subscription"("shop");

-- CreateIndex
CREATE INDEX "Subscription_shop_idx" ON "Subscription"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "Session_id_key" ON "Session"("id");

-- CreateIndex
CREATE INDEX "Session_id_idx" ON "Session"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_id_key" ON "Settings"("id");

-- CreateIndex
CREATE INDEX "Settings_storeId_idx" ON "Settings"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Orders_id_key" ON "Orders"("id");

-- CreateIndex
CREATE INDEX "Orders_storeId_idx" ON "Orders"("storeId");

-- AddForeignKey
ALTER TABLE "ShopData" ADD CONSTRAINT "ShopData_shop_fkey" FOREIGN KEY ("shop") REFERENCES "Shop"("shop") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_shop_fkey" FOREIGN KEY ("shop") REFERENCES "Shop"("shop") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
