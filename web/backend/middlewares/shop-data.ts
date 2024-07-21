import type { Session, HttpResponseError } from "@shopify/shopify-api";
import type { Express, Request, Response, NextFunction } from "express";
import type { ShopDataResponse } from "../../@types/shop";
import shops from "../prisma/db/shops";
// import shopify from "../shopify";
import { postRequest } from "../utils/axios";
import {
  generateRequiredScripts,
  saveInMetafields,
} from "../helpers/metafields";
import { createShopifyApp } from "../shopify";
import mixpanel from "../helpers/mixpanel";
import { getShopData } from "../prisma/db/shop-data";

const GET_SHOP_DATA = `{
  shop {
    id
    name
    ianaTimezone
    email
    url
    currencyCode
    currencyFormats{
      moneyFormat
    }
    primaryDomain {
      url
      sslEnabled
    }
    plan {
      displayName
      partnerDevelopment
      shopifyPlus
    }
    billingAddress {
      address1
      address2
      formatted
      company
      city
      country
      zip
      phone
    }
  }
}`;

export default function updateShopDataMiddleware(app: Express) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { session } = res.locals.shopify;
    // update db and mark shop as active
    await updateShopData(app, session);
    return next();
  };
}

async function updateShopData(app: Express, session: Session) {
  // 1. Save the merchant details in the Splash API...
  // 2. Save the Splash GroupBuy Widget in the Shop level metafields...
  const existingShop = await shops.getShop(session.shop);
  let shopInfo: any = await getShopData(session.shop);

  const betaShops: string[] = [];

  let fetchShopData = true;

  if (!existingShop) {
    console.log("============== NEW-INSTALL APP ==============");
    // let splashEndpoint = `${process.env.SPLASH_API_URL}/api/merchant`;
    // let merchantID = "2f6df039-0f0f-45a5-8f3a-c6b4a08150b7";
    await shops.createShop({
      shop: session.shop,
      scopes: session.scope,
      isInstalled: true,
      installedAt: new Date(),
      uninstalledAt: null,
      installCount: 1,
      showOnboarding: true,
      settings: {
        beta: betaShops.includes(session.shop) ? true : false,
        setupGuide: true,
        setupSteps: [
          {
            id: 0,
            complete: false,
          },
          {
            id: 1,
            complete: false,
          },
          {
            id: 2,
            complete: false,
          },
        ],
      },
    });
    // try {
    //   let response = await postRequest(splashEndpoint as string, {
    //     apiKey: session.accessToken,
    //     url: "https://" + session.shop,
    //     merchantID: merchantID,
    //   });
    //   console.log(response);
    // } catch (error) {
    //   console.log(error);
    // }
    let { html } = await generateRequiredScripts({});
    await saveInMetafields(session, html);
  } else {
    if (existingShop.shopData) {
      fetchShopData = false;
    }

    if (!existingShop.isInstalled) {
      // This is a REINSTALL
      console.log("============== REINSTALL APP ==============");
      await shops.updateShop({
        shop: session.shop,
        scopes: session.scope,
        isInstalled: true,
        installedAt: new Date(),
        uninstalledAt: null,
        installCount: existingShop.installCount + 1,
        showOnboarding: true,
        settings: {
          beta: true,
          setupGuide: true,
          setupSteps: [
            {
              id: 0,
              complete: false,
            },
            {
              id: 1,
              complete: false,
            },
            {
              id: 2,
              complete: false,
            },
          ],
        },
        subscription: {
          update: {
            active: true,
            plan: "TRIAL",
            createdAt: new Date(),
            upgradedAt: null,
            currentPeriodEnd: null,
            chargeId: null,
          },
        },
      });
      // Track reinstall event
      mixpanel.track("App ReInstall", {
        shop: session.shop,
        distinct_id: session.shop,
        installCount: existingShop.installCount + 1,
        shopifyPlan: shopInfo?.plan?.shopifyPlus,
      });
      let { html } = await generateRequiredScripts({});
      await saveInMetafields(session, html);
    }
  }

  if (fetchShopData) {
    try {
      const shopify = createShopifyApp(session.shop);
      const client = new shopify.api.clients.Graphql({
        session,
      });

      const res = await client.query<ShopDataResponse>({ data: GET_SHOP_DATA });

      if (!res?.body?.data?.shop) {
        console.warn(`Missing shop data on ${session.shop}`);
      } else {
        const shopData = res.body.data.shop;
        // console.log("Got shops data", shopData);

        await shops.updateShop({
          shop: session.shop,
          shopifyShopData: {
            upsert: {
              create: shopData,
              update: shopData,
            },
          },
        });
        // Track install event
        mixpanel.track("App Install", {
          shop: session.shop,
          distinct_id: session.shop,
          installCount: 1,
          email: shopData?.email,
          shopifyPlan: shopData?.plan?.shopifyPlus,
        });
        let { html } = await generateRequiredScripts({});
        await saveInMetafields(session, html);
      }
    } catch (error) {
      console.log("Failed to fetch shop data:", error);
      console.log("Error Response:", (error as HttpResponseError).response);
    }
  }
}
