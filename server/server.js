import express from "express";
import cors from "cors";
import barcodeRoutes from "./routes/barcodeRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/barcode", barcodeRoutes);
app.use("/items", itemRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log("Server running on port", PORT));
