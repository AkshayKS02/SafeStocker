import { Router } from "express";
import { handleBarcode, getLatestScan } from "../controllers/barcodeController.js";

const router = Router();

router.post("/", handleBarcode);
router.get("/latest", getLatestScan);

export default router;

