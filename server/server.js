import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import db from "./config/db.js";

// Route Imports
import barcodeRoutes from "./routes/barcodeRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();

const app = express();

// 1. Mobile-Friendly CORS
// origin: true allows the mobile app to connect via your local IP [cite: 36, 37]
app.use(cors({
  origin: true, 
  credentials: true
}));

app.use(express.json());
app.set("trust proxy", 1);

// 2. Session Management
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax", // Necessary for cross-site auth flows [cite: 9]
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// 3. Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback" 
}, async (accessToken, refreshToken, profile, done) => {
    const email = profile.emails[0].value;
    const name = profile.displayName;
    const picture = profile.photos?.[0]?.value || "";

    try {
        const [rows] = await db.query( 
            "SELECT ShopID, OwnerName, Email FROM shop WHERE Email = ?",
            [email]
        );

        if (rows.length > 0) {
            return done(null, { ...rows[0], isNew: false, picture });
        }

        const phone = "9" + Math.floor(100000000 + Math.random() * 900000000);
        const [result] = await db.query(
            "INSERT INTO shop (OwnerName, Phone, Email) VALUES (?,?,?)",
            [name, phone , email]
        );

        return done(null, {
            ShopID: result.insertId,
            OwnerName: name,
            Email: email,
            isNew: true,
            picture
        });
    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// 4. API Routes
app.use("/barcode", barcodeRoutes);
app.use("/items", itemRoutes);
app.use("/stock", stockRoutes);
app.use("/invoice", invoiceRoutes);
app.use("/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);

// 5. Mobile-Specific Auth Endpoints
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/login-failed" }),
  (req, res) => {
    // Redirects the mobile browser back to your React Native app via Deep Link [cite: 49, 55]
    const appScheme = "safestocker"; 
    res.send(`
      <html>
        <body>
          <script>window.location.href = "${appScheme}://home?login=success";</script>
          <p>Authenticating... Please wait.</p>
        </body>
      </html>
    `);
  }
);

app.get("/auth/google/user", (req, res) => {
  if (!req.user) return res.json({ loggedIn: false });
  return res.json({ loggedIn: true, shop: req.user });
});

app.post("/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.json({ success: false });
    req.session.destroy(() => res.json({ success: true }));
  });
});

// 6. Health Check Route
app.get("/", (req, res) => {
  res.json({ status: "API is running" }); // Confirms connection on mobile [cite: 38, 41]
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0" ,() => console.log(`Mobile API listening on port ${PORT}`));