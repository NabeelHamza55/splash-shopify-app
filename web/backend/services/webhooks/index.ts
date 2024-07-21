import { createShopifyApp } from "../../shopify";
export const orderCreate = async (shop: string, payload: any) => {
  let deliveryDate;
  let deliveryTime;
  let customerName;
  let selectedOption;
  const shopify = createShopifyApp(shop);
  const storeId = await shopify.api.session.getOfflineId(shop);
  const {
    id,
    name,
    note_attributes,
    order_number,
    customer,
    total_price,
    line_items,
    financial_status,
    fulfillment_status,
    shipping_address,
  } = payload;
  customerName = `${customer?.first_name ?? ""} ${customer?.last_name ?? ""}`;
  // console.log({
  //   storeId,
  //   orderId: id,
  //   name,
  //   deliveryDate: deliveryDate ?? "",
  //   deliveryTime: deliveryTime ?? "",
  //   customerName: customerName.trim(),
  //   total: parseFloat(total_price),
  //   paymentStatus: financial_status,
  //   fulfilmentStatus: fulfillment_status ?? "unFulfilled",
  //   deliveryMethod: shipping_address ? "Shipping" : "Pick Up",
  //   items: line_items.length,
  //   note_attributes,
  // });
  if (note_attributes.length > 0) {
    for (const attribute of note_attributes) {
      switch (attribute.name) {
        case "Delivery Date":
          deliveryDate = attribute.value;
          break;
        case "Delivery Time":
          deliveryTime = attribute.value;
          break;
        case "Selected Option":
          selectedOption = attribute.value;
          break;
        default:
          break;
      }
    }
  }
  console.log(deliveryDate, deliveryTime, selectedOption);
};

export const orderUpdate = async (shop: string, payload: any) => {
  let deliveryDate;
  let deliveryTime;
  let customerName;
  const shopify = createShopifyApp(shop);
  const storeId = await shopify.api.session.getOfflineId(shop);
  const {
    id,
    name,
    note_attributes,
    order_number,
    customer,
    total_price,
    line_items,
    financial_status,
    fulfillment_status,
    shipping_address,
  } = payload;
  customerName = `${customer?.first_name ?? ""} ${customer?.last_name ?? ""}`;
  console.log({
    deliveryDate: deliveryDate ?? "",
    deliveryTime: deliveryTime ?? "",
    customerName,
    total: parseFloat(total_price),
    paymentStatus: financial_status,
    fulfilmentStatus: fulfillment_status ?? "unFulfilled",
    items: line_items.length,
  });
};

export const orderDelete = async (shop: string, payload: any) => {
  try {
    console.log({ shop, payload });
    const shopify = createShopifyApp(shop);
    const storeId = await shopify.api.session.getOfflineId(shop);
  } catch (err) {
    console.log("unable to process Order Delete Webhook", err);
  }
};
