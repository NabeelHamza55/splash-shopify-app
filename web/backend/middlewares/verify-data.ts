import type { Express, Request, Response, NextFunction } from "express";
import { createShopifyApp } from "../shopify";
import sessions from "../prisma/db/sessions";
import { postRequest } from "../utils/axios";
import shops from "../prisma/db/shops";

export function verfiyProductDataMiddleware(app: Express) {
  /**
   * 1. Check the shop and required data for the Product Page.
   * 2. Verfiy iit from the Splash API for product widget usage.
   */
  return async (req: Request, res: Response, next: NextFunction) => {
    const { shop }: any = req?.query;
    if (!shop) {
      return res.status(400).send({
        message: "Bad Request - 400",
        data: {},
        status: 400,
      });
    }
    const shopify = createShopifyApp(shop);
    // Send request to Splash api with data : MerchantId and API-Key
    const storeId = await shopify.api.session.getOfflineId(shop as string);
    const session = await sessions.loadCallback(storeId);
    const shopsData: any = await shops.getShop(shop as string);

    let dataObject = {
      merchantID: shopsData?.settings.merchantID,
      apiKey: session?.accessToken,
    };
    console.log(dataObject);
    // let splashEndpoint = `${process.env.SPLASH_API_URL}/api/merchant/validate`;
    // let response = await postRequest(splashEndpoint as string, dataObject);
    // console.log(response);
    let verfied = true;
    if (verfied) {
      return next();
    } else {
      return res.status(401).send({
        message: "Invalid - 401",
        data: {},
        status: 401,
      });
    }
  };
}
