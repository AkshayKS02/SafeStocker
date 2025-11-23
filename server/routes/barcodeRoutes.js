import { Router } from "express";
import { handleBarcode } from "../controllers/barcodeController.js";

const router = Router();

router.post("/", handleBarcode);

export default router;
