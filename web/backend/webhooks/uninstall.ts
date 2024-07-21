import { DeliveryMethod } from "@shopify/shopify-api";
import shops from "../prisma/db/shops";
// import shopify from "../shopify";
import { useShopifyApp } from "@paweljedrzejczyk/shopify-multistore-app-middleware";
import mixpanel from "../helpers/mixpanel";
import { getShopData } from "../prisma/db/shop-data";

export function getDifferenceInDaysFromCurrentDate(date1Str: Date) {
  const date1 = new Date(date1Str);
  const date2 = new Date();
  const diffTime = Math.abs(+date2 - +date1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function getNewTrialDaysValue(currentTrialDays: number, installedAt: Date) {
  const diffDays = getDifferenceInDaysFromCurrentDate(installedAt);
  const newTrialDays = currentTrialDays - diffDays;
  return newTrialDays > 0 ? newTrialDays : 0;
}

async function uninstall(shop: string) {
  console.log("Event: Uninstall on shop", shop);

  const shopData = await shops.getShop(shop);
  let shopInfo: any = await getShopData(shop);
  const trialDaysObj =
    shopData?.installedAt && shopData?.subscription?.trialDays
      ? {
          trialDays: getNewTrialDaysValue(
            shopData?.subscription?.trialDays,
            shopData.installedAt
          ),
        }
      : {};

  await shops.updateShop({
    shop,
    isInstalled: false,
    uninstalledAt: new Date(),
    showOnboarding: true,
    subscription: {
      update: {
        active: false,
        ...trialDaysObj,
        planSlug: null,
      },
    },
  });
  mixpanel.track("App Uninstall", {
    shop,
    distinct_id: shop,
    email: shopInfo?.email,
    shopifyPlan: shopInfo?.plan?.shopifyPlus,
  });
}

export default async function addUninstallWebhookHandler() {
  useShopifyApp((shopifyApp: any) =>
    shopifyApp.api.webhooks.addHandlers({
      APP_UNINSTALLED: {
        deliveryMethod: DeliveryMethod.Http,
        callbackUrl: "/api/webhooks",
        callback: async (topic: string, shop: string) => {
          console.log("Uninstall app webhook invoked", topic, shop);
          await uninstall(shop);
        },
      },
    })
  );
}
