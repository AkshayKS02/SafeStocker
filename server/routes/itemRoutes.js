import { Router } from "express";
import { getAllItems } from "../controllers/itemController.js";

const router = Router();

// GET /items → return everything from items.json
router.get("/", getAllItems);

export default router;
