import express, { type Request, type Response } from "express";
import { saveMerchantSettings } from "../../controllers/merchant";

const router = express.Router();

router.post("/updateSettings", saveMerchantSettings);

export default router;
