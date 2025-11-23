import { Router } from "express";
import { getAllItems, saveNewItem } from "../controllers/itemController.js";

const router = Router();

// GET /items → return everything from items.json
router.get("/", getAllItems);

// POST /items/add → save new item
router.post("/add", saveNewItem);

export default router;

