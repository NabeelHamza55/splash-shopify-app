import express from "express";
import { getAppSettings } from "../../controllers/extension";

const router = express.Router();

router.post("/getSettings", getAppSettings);

export default router;
