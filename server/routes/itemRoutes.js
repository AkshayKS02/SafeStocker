import express from "express";
import { getAllItems, addItem } from "../controllers/itemController.js";

const router = express.Router();

router.get("/", getAllItems);
router.post("/", addItem);

export default router;


