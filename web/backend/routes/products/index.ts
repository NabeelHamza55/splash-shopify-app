import express, { type Request, type Response } from "express";
import productCreator from "../../services/product-creator";
import {
  getVariantsFromShopify,
  updateVariantFromShopify,
} from "../../controllers/products";
import { getShopifyApp } from "@paweljedrzejczyk/shopify-multistore-app-middleware";

const router = express.Router();

router.post("/getAllVariants", getVariantsFromShopify);
router.put("/updateVariant", updateVariantFromShopify);
router.get("/count", async (req: Request, res: Response) => {
  try {
    const shopify = getShopifyApp(res);
    const countData = await shopify.api.rest.Product.count({
      session: res.locals.shopify.session,
    });
    res.status(200).send(countData);
  } catch (error) {
    res.status(500).send((error as Error).message);
  }
});

router.get("/create/:product_count", async (req: Request, res: Response) => {
  const { product_count } = req.params;
  let status = 200;
  let error = null;
  try {
    await productCreator(res.locals.shopify.session, +product_count);
  } catch (e) {
    console.log(`Failed to process products/create: ${(e as Error).message}`);
    status = 500;
    error = (e as Error).message;
  }
  res.status(status).send({ success: status === 200, error });
});

export default router;
