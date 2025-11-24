import express from "express";
import cors from "cors";
import barcodeRoutes from "./routes/barcodeRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import { exec } from "child_process";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/run-scanner", (req, res) => {
    exec("py ./python/barcode.py", (err, stdout) => {
        if (err) return res.status(500).send("Error running scanner");
        
        const barcode = stdout.trim();  
        console.log("Scanned:", barcode);

        res.json({ barcode });   // <-- return barcode
    });
});

// Routes
app.use("/barcode", barcodeRoutes);
app.use("/items", itemRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log("Server running on port", PORT));
