import express from "express";
import { loginOwner} from "../controllers/authController.js";

const router = express.Router();

// Manual login → using phone number
router.post("/login", loginOwner);

export default router;
