import express from "express";
import cors from "cors";
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import db from "./config/db.js";

// Routes
import barcodeRoutes from "./routes/barcodeRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import auth from "./middleware/auth.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ======================
// 🔹 MIDDLEWARE
// ======================
app.use(cors({
  origin: true,
  credentials: false
}));

app.use(express.json());
app.set("trust proxy", 1);

// ======================
// 🔹 STATIC (WEB)
// ======================
app.use(express.static(path.join(__dirname, "../client/public")));
app.use("/src", express.static(path.join(__dirname, "../client/src")));
app.use("/static", express.static(path.join(__dirname, "static")));
app.use("/templates", express.static(path.join(__dirname, "templates")));

// ======================
// 🔹 PASSPORT (NO SESSION)
// ======================
app.use(passport.initialize());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {

  const email = profile.emails[0].value;
  const name = profile.displayName;
  const picture = profile.photos?.[0]?.value || "";

  try {
    const result = await db.query(
      `SELECT "ShopID","OwnerName","Email"
       FROM shop
       WHERE "Email" = $1`,
      [email]
    );

    if (result.rows.length > 0) {
      return done(null, {
        ...result.rows[0],
        isNew: false,
        picture
      });
    }

    const phone = "9" + Math.floor(100000000 + Math.random() * 900000000);

    const insert = await db.query(
      `INSERT INTO shop ("OwnerName","Phone","Email")
       VALUES ($1,$2,$3)
       RETURNING *`,
      [name, phone, email]
    );

    return done(null, {
      ...insert.rows[0],
      isNew: true,
      picture
    });

  } catch (err) {
    console.error("OAuth error:", err);
    return done(err);
  }
}));

// ======================
// 🔹 GOOGLE AUTH
// ======================
app.get("/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false
  })
);

// 🔥 MAIN CALLBACK (WEB + MOBILE)
app.get("/auth/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {

    const user = req.user;

    const token = jwt.sign(
      {
        ShopID: user.ShopID,
        OwnerName: user.OwnerName,
        Email: user.Email
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const isMobile = req.headers["user-agent"]?.includes("Mobile");

    if (isMobile) {
      // 📱 Mobile deep link
      return res.send(`
        <script>
          window.location.href = "safestocker://login?token=${token}";
        </script>
      `);
    }

    // 🌐 Web redirect
    return res.redirect(`/login-success.html?token=${token}`);
  }
);

// ======================
// 🔹 PROTECTED ROUTES
// ======================
app.use("/barcode", auth, barcodeRoutes);
app.use("/items", auth, itemRoutes);
app.use("/stock", auth, stockRoutes);
app.use("/invoice", auth, invoiceRoutes);
app.use("/dashboard", auth, dashboardRoutes);

// ======================
// 🔹 WEB LOGIN SUCCESS PAGE
// ======================
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

// ======================
// 🔹 ROOT
// ======================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/public/index.html"));
});

// ======================
// 🔹 START SERVER
// ======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});