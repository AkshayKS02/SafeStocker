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
import dashboardRoutes from "./routes/dashboardRoutes.js";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import db from "./config/db.js";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("trust proxy", 1);
app.use(cors({
  origin: true,
  credentials: true
}));
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
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://safestocker.onrender.com/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {

    const email = profile.emails[0].value;
    const name = profile.displayName;
    const picture = profile.photos?.[0]?.value || "";

    try {
        // Lookup shop owner (Promise-based query)
        const [rows] = await db.query( 
            "SELECT ShopID, OwnerName, Email FROM shop WHERE Email = ?",
            [email]
        );

        // Owner exists → login success
        if (rows.length > 0) {
            return done(null, {
                ShopID: rows[0].ShopID,
                OwnerName: rows[0].OwnerName,
                Email: rows[0].Email,
                isNew: false,
                picture 
            });
        }

        const phone = "9" + Math.floor(100000000 + Math.random() * 900000000);
        // Owner does NOT exist → create shop entry
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
        console.error("3. Critical error in Passport strategy:", err);
        return done(err);
    }
}));


passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Routes
if (process.env.NODE_ENV !== "production") {
  app.get("/run-scanner", (req, res) => {
    exec("py ./python/barcode.py", (err, stdout) => {
      if (err) return res.status(500).send("Error running scanner");
      const barcode = stdout.trim();
      console.log("Scanned:", barcode);
      res.json({ barcode });
    });
  });
}

app.use("/barcode", barcodeRoutes);
app.use("/items", itemRoutes);
app.use("/stock", stockRoutes);
app.use("/invoice", invoiceRoutes);
app.use("/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);

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

  // Return user data with picture
  return res.json({
    loggedIn: true,
    shopFound: true,
    shop: {
      ShopID: req.user.ShopID,
      OwnerName: req.user.OwnerName,
      Email: req.user.Email,
      isNew: req.user.isNew,
      picture: req.user.picture 
    }
  });
});

app.post("/auth/logout", (req, res, next) => {
  req.logout(function(err) {
    if (err) { 
      console.error("Logout error:", err);
      return res.json({ success: false, message: "Logout failed" });
    }
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
      }
      res.json({ success: true });
    });
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