import { type Request, type Response } from "express";
import shops from "../prisma/db/shops";
export const getOnBoardingDetails = async (req: Request, res: Response) => {
  // get the ShopData.
  try {
    // For Postman Route test
    // let shop = req.query.shop;
    // const storeId = await shopify.api.session.getOfflineId(shop as string);
    let session = res.locals.shopify.session;
    const shopsData: any = await shops.getShop(session?.shop as string);

    res.status(200).send({
      data: shopsData,
      message: "Got OnBoarding Data Successfully",
      status: 200,
    });
  } catch (err) {
    throw new Error(` Failed to get the Onboarding data: ${err}`);
  }
};
