import { type Request, type Response } from "express";
import { getAllVariants } from "../helpers/graphQL/queries";
import shops from "../prisma/db/shops";
import mixpanel from "../helpers/mixpanel";
import { postRequest } from "../utils/axios";

export const saveMerchantSettings = async (req: Request, res: Response) => {
  try {
    let { merchantID, splashAPIKey } = req.body;
    let session = res.locals.shopify.session;
    const shopsData: any = await shops.getShop(session?.shop as string);
    await shops.updateShop({
      shop: session?.shop,
      settings: {
        ...shopsData.settings,
        merchantID: merchantID || "",
        splashAPIKey: splashAPIKey || "",
      },
    });
    let splashEndpoint = `${process.env.SPLASH_API_URL}/api/merchant`;
    try {
      let response = await postRequest(splashEndpoint as string, {
        apiKey: session.accessToken,
        url: "https://" + session.shop,
        merchantID: merchantID,
      });
      console.log(response);
    } catch (error) {
      console.log(error);
    }
    mixpanel.track("Merchant Settings Saved", {
      shop: session.shop,
      distinct_id: session.shop,
    });
    res.status(200).send({
      shop: {},
      data: [],
      message: "Merchant Data Saved Successfully",
      status: 200,
    });
  } catch (err) {
    throw new Error(` Failed to update the Merchant data: ${err}`);
  }
};
