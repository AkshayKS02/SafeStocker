import express from "express";
import cors from "cors";
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import barcodeRoutes from "./routes/barcodeRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import db from "./config/db.js";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

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

    const email = profile.emails[0].value;
    const name = profile.displayName;

    // Lookup shop owner
    db.query(
        "SELECT ShopID, OwnerName, Email FROM Shop WHERE Email = ?",
        [email],
        (err, rows) => {
            if (err) return done(err);

            // Owner exists → login success
            if (rows.length > 0) {
                return done(null, {
                    ShopID: rows[0].ShopID,
                    OwnerName: rows[0].OwnerName,
                    Email: rows[0].Email,
                    isNew: false
                });
            }

            // Owner does NOT exist → create shop entry
            db.query(
                "INSERT INTO Shop (OwnerName, Phone, Email) VALUES (?, NULL, ?)",
                [name, email],
                (err2, result) => {
                    if (err2) return done(err2);

                    return done(null, {
                        ShopID: result.insertId,
                        OwnerName: name,
                        Email: email,
                        isNew: true
                    });
                }
            );
        }
    );
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
app.use("/auth", authRoutes);

app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/?google_login=1");
  }
);

app.get("/auth/google/user", (req, res) => {

  if (!req.user) {
    return res.json({ loggedIn: false });
  }

  // If this user was auto-created or already existed
  return res.json({
    loggedIn: true,
    shopFound: true,
    shop: {
      ShopID: req.user.ShopID,
      OwnerName: req.user.OwnerName,
      Email: req.user.Email,
      isNew: req.user.isNew
    }
  });
});


app.get("/auth/logout", (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect("/");
  });
});


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/public/index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
