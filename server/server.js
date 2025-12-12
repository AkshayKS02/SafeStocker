import express from "express";
import cors from "cors";
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import barcodeRoutes from "./routes/barcodeRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../client/public")));
// Serve /public (HTML, images)
app.use(express.static(path.join(__dirname, "../client/public")));

// Serve /src (JS, CSS)
app.use("/src", express.static(path.join(__dirname, "../client/src")));

// serve static assets (CSS/images) for Puppeteer and browser
app.use("/static", express.static(path.join(__dirname, "static")));

// serve templates so Puppeteer can load them via HTTP
app.use("/templates", express.static(path.join(__dirname, "templates")));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

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

app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/?logged_in=true");
  }
);

app.get("/auth/user", (req, res) => {
  res.json({ user: req.user || null });
});

app.get("/auth/logout", (req, res) => {
  req.logout(() => {});
  res.redirect("/");
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/public/index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
