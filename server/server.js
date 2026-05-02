import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import passport from "passport";
import configureGoogleAuth from "./auth/googleAuth.js";

import authRoutes from "./routes/authRoutes.js";
import barcodeRoutes from "./routes/barcodeRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import auth from "./middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env"), quiet: true });

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: false
}));

app.use(express.json());
app.set("trust proxy", 1);

// Static web assets
app.use(express.static(path.join(__dirname, "../client/public")));
app.use("/src", express.static(path.join(__dirname, "../client/src")));
app.use("/static", express.static(path.join(__dirname, "static")));
app.use("/templates", express.static(path.join(__dirname, "templates")));

// Auth
app.use(passport.initialize());
configureGoogleAuth(passport);
app.use("/auth", authRoutes);

// Protected routes
app.use("/barcode", auth, barcodeRoutes);
app.use("/items", auth, itemRoutes);
app.use("/stock", auth, stockRoutes);
app.use("/invoice", auth, invoiceRoutes);
app.use("/dashboard", auth, dashboardRoutes);

// Web login success page
app.get("/login-success.html", (req, res) => {
  res.send(`
    <html>
      <body>
        <script>
          const token = new URLSearchParams(window.location.search).get("token");
          localStorage.setItem("auth_token", token);
          window.location.href = "/";
        </script>
      </body>
    </html>
  `);
});

// Root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/public/index.html"));
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
