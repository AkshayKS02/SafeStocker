import express from "express";
import {
  getDashboardOverview,
  getBiggestRevenueDays,
  getRecentOrders,
  getRevenueGraph
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/overview", getDashboardOverview);
router.get("/biggest-days", getBiggestRevenueDays);
router.get("/orders", getRecentOrders);
router.get("/graph", getRevenueGraph);

export default router;
