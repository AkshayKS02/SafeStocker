import express from "express";
import {
    addStock,
    getStockByShop,
    updateStockQuantity
} from "../controllers/stockController.js";

const router = express.Router();

// Add stock batch
router.post("/", addStock);

// Get stock for this merchant’s shop
router.get("/:shopID", getStockByShop);

// Update quantity in a batch
router.put("/:stockID", updateStockQuantity);

export default router;
