import { Session } from "@shopify/shopify-api";
import { createShopifyApp } from "../../shopify";
// import shopify from "../../shopify";

export const generateRequiredScripts = async (settings: any) => {
  console.log("GENERATE REQUIRED SCRIPTS ===>>>");
  let html = `
  {% assign productMeta = product.first_available_variant.metafields.splash.settings |  default: "{}" %}
  <script id="splash-discount-json" type="application/json" >{{ productMeta }}</script>
  <script id="splash-product-json" type="application/json" >{{ product | json}}</script>

  <div id="splash-widget">
  <splash-product-widget data-widget-id="SPLASH-PRODUCT-WIDGET">
    <div class="product-form__buttons">
      <button class="splash--button {{ block.settings.splash_button_classes |  default: "button button--full-width button--primary" }}" id="splash-group-buy-button">
          <div class="group-buy-content">
            <img src="{{ 'splash-button.png' | asset_img_url: 'small' }}" height="24" width="24" loading="lazy" />
            <span>{{ 'splash.button.text' | t }}</span>
          </div>
          <div class="group-buy-prices">
            <div class="group-buy-price-diff">
              <span class="splash-original-price">{{ product.price | money }}</span>
              <span class="splash-discounted-price">{{ productMeta.value.groupDiscountedPrice |  times: 100 | money }}</span>
            </div>
            <div class="splash-discount-badge">
              <span>-{{ productMeta.value.groupDiscountPercentage }}%</span>
            </div>
          </div>
      </button>
    </div>
    <div id="splash-popup-backdrop" class="splash-backdrop"></div>
    <div id="splash-group-buy-message" class="splash-message">{{ 'splash.button.text' | t }}</div>
  </splash-product-widget>
  </div>

  `;
  return { html };
};

export const saveInMetafields = async (session: Session, html: any) => {
  let shopify = createShopifyApp(session.shop);
  const client = new shopify.api.clients.Rest({ session });
  const htmlMeta = await client.post({
    path: `metafields`,
    data: {
      metafield: {
        namespace: "splash",
        key: `splash_widget`,
        type: "string",
        value: html,
      },
    },
  });
  console.log("SAVED DATA in METAFIELDS");
};
