// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import { createShopifyApp, shopifyAppConfig } from "./shopify";

// For Multi-Store Installation using different app
import {
  createMultistoreMiddleware,
  useShopifyApp,
  getShopifyApp,
} from "@paweljedrzejczyk/shopify-multistore-app-middleware";

// Import Webhooks
import GDPRWebhookHandlers from "./webhooks/gdpr";
import { addWebhookHandlers } from "./webhooks";

// Import Routes
import mountRoutes, { mountUnAuthenticatedRoutes } from "./routes";
import updateShopDataMiddleware from "./middlewares/shop-data";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "8081",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/../frontend/dist`
    : `${process.cwd()}/../frontend/`;

const app = express();

app.use(createMultistoreMiddleware(createShopifyApp));

// Set up Shopify authentication and webhook handling
app.get(
  shopifyAppConfig.auth.path,
  useShopifyApp((shopifyApp) => shopifyApp.auth.begin())
);
app.get(
  shopifyAppConfig.auth.callbackPath,
  useShopifyApp((shopifyApp) => shopifyApp.auth.callback()),
  updateShopDataMiddleware(app),
  useShopifyApp((shopifyApp) => shopifyApp.redirectToShopifyOrAppRoot())
);

console.log(process.env.HOST);

// Set up Shopify webhooks
app.post(
  shopifyAppConfig.webhooks.path,
  useShopifyApp((shopifyApp) =>
    shopifyApp.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
  )
);
await addWebhookHandlers();

// Unauthenticated routes
app.use(express.json());
mountUnAuthenticatedRoutes(app);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use(
  "/api/*",
  useShopifyApp((shopifyApp) => shopifyApp.validateAuthenticatedSession())
);

app.use(express.json());

// Authenticated routes
mountRoutes(app);

app.use(serveStatic(STATIC_PATH, { index: false }));

app.use(
  "/*",
  useShopifyApp((shopifyApp) => shopifyApp.ensureInstalledOnShop()),
  async (_req, res, _next) => {
    return res
      .status(200)
      .set("Content-Type", "text/html")
      .send(readFileSync(join(STATIC_PATH, "index.html")));
  }
);

app.listen(PORT);
console.log(`App running on port: ${PORT} ...`);
