import express, { type Request, type Response } from "express";
import {
  getThemeDetails,
  updateOnBoardingDetails,
} from "../../controllers/theme";

const router = express.Router();

router.get("/getDetails", getThemeDetails);
router.post("/updateOnboarding", updateOnBoardingDetails);

export default router;
