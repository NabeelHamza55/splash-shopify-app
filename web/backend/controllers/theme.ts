import { type Request, type Response } from "express";
import shops from "../prisma/db/shops";
import { createShopifyApp } from "../shopify";

export const getThemeDetails = async (req: Request, res: Response) => {
  let themeDetails = {
    isNotVintageTheme: false,
    isGroupBuyActivated: false,
    deepLink: "",
  };
  try {
    const APP_BLOCK_TEMPLATES = ["product"];
    let session = res.locals.shopify.session;
    const shopsData: any = await shops.getShop(session?.shop as string);
    const shopify = createShopifyApp(session?.shop);
    const themeData = await shopify.api.rest.Theme.all({
      session: session,
    });
    // GET the published/live theme...
    const publishedTheme: any = themeData?.data.find(
      (theme: any) => theme.role === "main"
    );
    // GET the main theme => assets
    const mainThemeAssets = await shopify.api.rest.Asset.all({
      session: session,
      theme_id: publishedTheme.id,
    });
    const templateJSONFiles = mainThemeAssets?.data.filter((file: any) => {
      return APP_BLOCK_TEMPLATES.some(
        (template) => file.key === `templates/${template}.json`
      );
    });
    if (templateJSONFiles.length > 0) {
      console.log(
        "Product templates support sections everywhere!",
        templateJSONFiles.length
      );
      themeDetails = {
        ...themeDetails,
        isNotVintageTheme: true,
      };
      const mainThemeAssets: any = await shopify.api.rest.Asset.all({
        session: session,
        theme_id: publishedTheme.id,
        asset: { key: "templates/product.json" },
      });
      const productJSON = JSON.parse(mainThemeAssets?.data[0]?.value);
      let hasSplashBlock = false;
      if (productJSON.sections) {
        let appSections = Object.values(productJSON.sections).filter(
          (v: any) => v.type == "apps"
        );
        if (appSections.length > 0) {
          hasSplashBlock = appSections.some(
            (section: any) =>
              section?.blocks &&
              Object.keys(section?.blocks)?.some((key) =>
                key.includes("splash_block")
              )
          );
        } else {
          hasSplashBlock = Object.values(productJSON?.sections)?.some(
            (section: any) =>
              section?.blocks &&
              Object.keys(section?.blocks)?.some((key) =>
                key.includes("splash_block")
              )
          );
        }
      }
      if (hasSplashBlock) {
        themeDetails = {
          ...themeDetails,
          isGroupBuyActivated: true,
        };
      } else {
        const deepLink = `${shopsData?.shopifyShopData?.url}/admin/themes/current/editor?template=product&addAppBlockId=${process.env.SHOPIFY_SPLASH_EXTENSION_ID}/splash-block&target=mainSection`;
        themeDetails = {
          ...themeDetails,
          isGroupBuyActivated: false,
          deepLink: deepLink,
        };
      }
    } else {
      themeDetails = {
        ...themeDetails,
        isNotVintageTheme: false,
      };
    }
    console.log(themeDetails);

    res.status(200).send({
      data: themeDetails,
      shopData: shopsData,
      message: "Got Theme Data Successfully",
      status: 200,
    });
  } catch (err) {
    console.log("err===>>", err);

    // throw new Error(` Failed to get the Variants data: ${err}`);
  }
};

export const updateOnBoardingDetails = async (req: Request, res: Response) => {
  // update the ShopData.
  try {
    let session = res.locals.shopify.session;
    let settings = req.body || {};

    const shopsData: any = await shops.getShop(session?.shop as string);
    const updatedShopData: any = await shops.updateShop({
      shop: session.shop,
      settings: {
        ...shopsData.settings,
        setupGuide: settings.setupGuide,
        setupSteps: settings.setupSteps,
      },
    });

    res.status(200).send({
      data: updatedShopData,
      message: "Updated OnBoarding Data Successfully",
      status: 200,
    });
  } catch (err) {
    throw new Error(` Failed to update the Onboarding data: ${err}`);
  }
};
