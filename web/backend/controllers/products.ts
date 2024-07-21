import { type Request, type Response } from "express";
import { getAllProducts, getAllVariants } from "../helpers/graphQL/queries";
import shops from "../prisma/db/shops";
import { DataType } from "@shopify/shopify-api";
import { getShopifyApp } from "@paweljedrzejczyk/shopify-multistore-app-middleware";
import mixpanel from "../helpers/mixpanel";
import { createShopifyApp } from "../shopify";

export const getVariantsFromShopify = async (req: Request, res: Response) => {
  try {
    let settings = req.body;
    let session = res.locals.shopify.session;
    const shopsData: any = await shops.getShop(session?.shop as string);

    let response = await getAllVariants(session, settings);
    // console.log({ ...response.body.data.products.edges });
    const variantsList = response?.body?.data?.products?.edges.flatMap(
      (product: any) =>
        product.node.variants.edges.map((variant: any) => {
          let image = variant.node?.image
            ? variant.node?.image?.url
            : product.node.featuredImage
            ? product.node.featuredImage.url
            : null;
          let metafieldValue = JSON.parse(
            variant.node?.metafield?.value || "{}"
          );
          let orignalPrice = variant.node?.compareAtPrice || variant?.node?.price;
          return {
            id: product.node.id,
            variantId: variant.node.id,
            title: variant.node.displayName,
            image:
              image ||
              "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png?v=1530129081",
            status: "",
            price: orignalPrice,
            groupDiscountPercentage:
              metafieldValue?.groupDiscountPercentage || 20,
            groupDiscountAmount: metafieldValue?.groupDiscountAmount || 20,
            groupDiscountedPrice:
              metafieldValue?.groupDiscountedPrice ||
              (orignalPrice - (orignalPrice * 20) / 100).toFixed(2),
            state: metafieldValue?.state || false,
          };
        })
    );
    res.status(200).send({
      shop: shopsData.shopifyShopData,
      data: variantsList,
      pageInfo: response.body.data?.products.pageInfo,
      message: "Got Variants Data Successfully",
      status: 200,
    });
  } catch (err) {
    console.log("Error==>>", err);
    // throw new Error(` Failed to get the Variants data: ${err}`);
  }
};
// Not ready......
export const getProductVariantsFromShopify = async (
  req: Request,
  res: Response
) => {
  try {
    let settings = req.body;
    let session = res.locals.shopify.session;
    const shopsData: any = await shops.getShop(session?.shop as string);

    let response = await getAllProducts(session, settings);
    // console.log({ ...response.body.data.products.edges });
    const productList = response?.body?.data?.products?.edges.flatMap(
      (product: any) => {
        let image = product.node?.images?.edges
          ? product.node?.images?.edges[0]?.node.url
          : product.node?.featuredImage
          ? product.node.featuredImage.url
          : null;
        let metafieldValue = JSON.parse(product.node?.metafield?.value || "{}");
        let obj = {
          id: product.node.id,
          // variantId: variant.node.id,
          title: product.node.title,
          image:
            image ||
            "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png?v=1530129081",
          status: "",
          price: product.node.price,
          groupDiscountPercentage:
            metafieldValue?.groupDiscountPercentage || 20,
          groupDiscountAmount: metafieldValue?.groupDiscountAmount || 20,
          groupDiscountedPrice:
            metafieldValue?.groupDiscountedPrice ||
            (product.node.price - (product.node.price * 20) / 100).toFixed(2),
          state: metafieldValue?.state || false,
        };
      }
    );
    res.status(200).send({
      shop: shopsData.shopifyShopData,
      data: productList,
      pageInfo: response.body.data?.products.pageInfo,
      message: "Got Variants Data Successfully",
      status: 200,
    });
  } catch (err) {
    console.log("Error==>>", err);
    // throw new Error(` Failed to get the Variants data: ${err}`);
  }
};

export const updateVariantFromShopify = async (req: Request, res: Response) => {
  try {
    let settings: any = req.body;
    console.log(settings);
    let session = res.locals.shopify.session;
    let variantId = settings.id.split("/").pop();
    const { data: variantMetafields } = await getShopifyApp(
      res
    ).api.rest.Metafield.all({
      session,
      variant_id: variantId,
      namespace: "splash",
      key: "settings",
    });

    const splashMetafields = variantMetafields.find((m: any) => {
      return m.type === "json" && m.key === "settings";
    });
    if (splashMetafields) {
      let splashSettings: any = JSON.parse(
        splashMetafields?.value?.toString() || "{}"
      );
      let splashString = JSON.stringify({
        ...splashSettings,
        groupDiscountPercentage: settings.data.groupDiscountPercentage,
        groupDiscountAmount: settings.data.groupDiscountAmount,
        groupDiscountedPrice: settings.data.groupDiscountedPrice,
        state: settings.data.state,
        [settings?.data.type]: settings?.data.value,
      });
      console.log("final=>", splashString);
      const client = new res.locals.shopify.app.api.clients.Rest({ session });
      const updatedMeta = await client.put({
        path: `variants/${variantId}/metafields/${splashMetafields?.id}`,
        data: {
          metafield: {
            id: splashMetafields?.id,
            namespace: "splash",
            key: "settings",
            type: "json",
            value: splashString,
          },
          type: DataType.JSON,
        },
      });
    } else {
      let splashString = JSON.stringify({
        groupDiscountPercentage: settings.data.groupDiscountPercentage,
        groupDiscountAmount: settings.data.groupDiscountAmount,
        groupDiscountedPrice: settings.data.groupDiscountedPrice,
        state: settings.data.state,
        [settings?.data.type]: settings?.data.value,
      });
      const client = new res.locals.shopify.app.api.clients.Rest({ session });
      const updatedMeta = await client.post({
        path: `variants/${variantId}/metafields`,
        data: {
          metafield: {
            id: splashMetafields?.id,
            namespace: "splash",
            key: "settings",
            type: "json",
            value: splashString,
          },
          type: DataType.JSON,
        },
      });
    }
    const shopify = createShopifyApp(session?.shop);
    const variantData = await shopify.api.rest.Variant.find({
      session: session,
      id: variantId,
      fields: "id,product_id,title,sku,price",
    });

    if (variantData) {
      let splashSettings: any = JSON.parse(
        splashMetafields?.value?.toString() || "{}"
      );
      mixpanel.track("Product Variant Updated", {
        shop: session.shop,
        distinct_id: session.shop,
        product_id: variantData.product_id,
        variant_id: variantData.id,
        title: variantData.title,
        sku: variantData.sku,
        "Group Buy": settings.data.state,
        "Group Discount Percentage - Latest":
          settings.data.groupDiscountPercentage,
        "Group Discount Amount - Latest": settings.data.groupDiscountAmount,
        "Group Discounted Price - Latest": settings.data.groupDiscountedPrice,
        "Group Discount Percentage - Prev":
          splashSettings.groupDiscountPercentage,
        "Group Discount Amount - Prev": splashSettings.groupDiscountAmount,
        "Group Discounted Price - Prev": splashSettings.groupDiscountedPrice,
      });
    }

    res.status(200).send({
      data: {},
      message: "Variant Data Updated Successfully",
      status: 200,
    });
  } catch (err) {
    throw new Error(` Failed to update the Variants data: ${err}`);
  }
};
