import express from "express";
import { handleBarcode } from "../controllers/barcodeController.js";

const router = express.Router();

router.post("/", handleBarcode);

export default router;


