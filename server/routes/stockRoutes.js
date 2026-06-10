import express from "express";
import {
    addStock,
    getStockByShop,
    deleteExpiredStock,
    updateStockQuantity,
    removeStock
} from "../controllers/stockController.js";

const router = express.Router();

router.post("/", addStock);
router.get("/", getStockByShop);
router.put("/:stockID", updateStockQuantity);
router.delete("/expire/:stockID", deleteExpiredStock);
router.delete("/:stockID", removeStock);

export default router;
