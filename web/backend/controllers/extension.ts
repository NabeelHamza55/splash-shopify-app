import { type Request, type Response } from "express";
import shops from "../prisma/db/shops";
import { createShopifyApp } from "../shopify";
import sessions from "../prisma/db/sessions";
import mixpanel from "../helpers/mixpanel";

export const getAppSettings = async (req: Request, res: Response) => {
  try {
    let shop: any = req?.query?.shop;
    let state: any = req?.query?.state;
    const productJSON = req?.body;
    const shopify = createShopifyApp(shop);
    const storeId = await shopify.api.session.getOfflineId(shop as string);
    const session = await sessions.loadCallback(storeId);
    // Send the related data to the product page...
    const shopsData: any = await shops.getShop(session?.shop as string);
    if (state) {
      mixpanel.track("Group Buy Button on PDP", {
        shop: shop,
        distinct_id: shop,
        display: true,
      });
    } else {
      mixpanel.track("Group Buy Button on PDP", {
        shop: shop,
        distinct_id: shop,
        display: false,
      });
    }
    res.status(200).send({
      data: shopsData?.settings || {},
      message: "Got App Settings Data Successfully",
      status: 200,
    });
  } catch (err) {
    throw new Error(` Failed to get the Onboarding data: ${err}`);
  }
};
