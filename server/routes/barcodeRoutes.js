import express from "express";
import { handleBarcode, getLatestScan } from "../controllers/barcodeController.js";
import { fetchFromOpenFoodFacts } from "../services/offAPI.js";

const router = express.Router();

// POST from Python scanner
router.post("/", handleBarcode);

// GET latest scan
router.get("/latest", getLatestScan);

// ✔ NEW: barcode details route
router.get("/details/:barcode", async (req, res) => {
  const { barcode } = req.params;

  try {
    const offData = await fetchFromOpenFoodFacts(barcode);
    if (!offData.product)
      return res.json({ found: false });

    const p = offData.product;

    res.json({
      product: {
        barcode,
        name: p.product_name || "Unknown",
        brand: p.brands || "Unknown",
        package_quantity: p.quantity || ""
      }
    });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;


