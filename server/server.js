import express from "express";
import cors from "cors";
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import barcodeRoutes from "./routes/barcodeRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// serve static assets (CSS/images) for Puppeteer and browser
app.use("/static", express.static(path.join(__dirname, "static")));

// serve templates so Puppeteer can load them via HTTP
app.use("/templates", express.static(path.join(__dirname, "templates")));

// Routes
app.get("/run-scanner", (req, res) => {
  exec("py ./python/barcode.py", (err, stdout) => {
    if (err) return res.status(500).send("Error running scanner");
    const barcode = stdout.trim();
    console.log("Scanned:", barcode);
    res.json({ barcode });
  });
});

app.use("/barcode", barcodeRoutes);
app.use("/items", itemRoutes);
app.use("/stock", stockRoutes);
app.use("/invoice", invoiceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
