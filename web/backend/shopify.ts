import {
  BillingInterval,
  BillingReplacementBehavior,
  LATEST_API_VERSION,
} from "@shopify/shopify-api";
import { shopifyApp, ShopifyApp } from "@shopify/shopify-app-express";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-07";

import sessions from "./prisma/db/sessions";
import { AppConfigParams } from "@shopify/shopify-app-express/build/ts/config-types";

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
const billingConfig: any = {
  Basic: {
    amount: 4.99,
    currencyCode: "USD",
    interval: BillingInterval.Every30Days,
    replacementBehavior: BillingReplacementBehavior.ApplyImmediately,
    trialDays: 14,
  },
};

// const shopify = shopifyApp({
//   api: {
//     apiVersion: LATEST_API_VERSION,
//     restResources,
//     billing: billingConfig || undefined, // or replace with billingConfig above to enable example billing
//   },
//   auth: {
//     path: "/api/auth",
//     callbackPath: "/api/auth/callback",
//   },
//   webhooks: {
//     path: "/api/webhooks",
//   },
//   // This should be replaced with your preferred storage strategy
//   sessionStorage: {
//     storeSession: sessions.storeCallback,
//     findSessionsByShop: sessions.findSessions,
//     loadSession: sessions.loadCallback,
//     deleteSession: sessions.deleteSession,
//     deleteSessions: sessions.deleteSessions,
//   },
// });

export const shopifyAppConfig: Pick<AppConfigParams, "auth" | "webhooks"> = {
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
};
const shopifyAppMap: Record<string, ShopifyApp> = {};

export const createShopifyApp = (shop: string): ShopifyApp => {
  console.log("THE SHOP = ", shop);
  // if (shopifyAppMap[shop]) {
  //   return shopifyAppMap[shop];
  // }
  const app = shopifyApp({
    api: {
      apiVersion: LATEST_API_VERSION,
      restResources,
      billing: billingConfig || undefined, // or replace with billingConfig above to enable example billing,
      apiKey:
        process.env[`SHOPIFY_API_KEY_${shop}`] || process.env.SHOPIFY_API_KEY,
      apiSecretKey:
        process.env[`SHOPIFY_API_SECRET_${shop}`] ||
        process.env.SHOPIFY_API_SECRET,
    },
    auth: shopifyAppConfig.auth,
    webhooks: shopifyAppConfig.webhooks,
    // This should be replaced with your preferred storage strategy
    sessionStorage: {
      storeSession: sessions.storeCallback,
      findSessionsByShop: sessions.findSessions,
      loadSession: sessions.loadCallback,
      deleteSession: sessions.deleteSession,
      deleteSessions: sessions.deleteSessions,
    },
  });

  // shopifyAppMap[shop] = app;

  return app;
};

// export default shopify;
