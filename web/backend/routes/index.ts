import type { Express } from "express";

import productRoutes from "./products";
import themeRoutes from "./theme";
import externalRoutes from "./extension";
import merchantRoutes from "./merchant";
import { verfiyProductDataMiddleware } from "../middlewares/verify-data";
import cors from "cors";

function mountRoutes(app: Express) {
  app.use("/api/products", productRoutes);
  app.use("/api/theme", themeRoutes);
  app.use("/api/merchant", merchantRoutes);
}
export function mountUnAuthenticatedRoutes(app: Express) {
  app.use(
    "/ext/product",
    cors(),
    verfiyProductDataMiddleware(app),
    externalRoutes
  );
}

export default mountRoutes;
