import express from "express";
import { createInvoice, createInvoiceMobile } from "../controllers/invoiceController.js";

const router = express.Router();
router.post("/", createInvoice);
router.post("/mobile", createInvoiceMobile);
export default router;
