import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import auth from "../middleware/auth.js";
import {
  createShopWithPassword,
  findShopByCredentials,
  toAuthUser
} from "../services/userService.js";

const router = express.Router();

function signAuthToken(user) {
  return jwt.sign(
    {
      ShopID: user.ShopID,
      OwnerName: user.OwnerName,
      Email: user.Email,
      picture: user.picture || ""
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// ── Web Google OAuth ──────────────────────────────────────────────────────────
router.get("/google", passport.authenticate("google-web", {
  scope: ["profile", "email"],
  session: false
}));

router.get("/google/callback",
  (req, res, next) => {
    passport.authenticate("google-web", { session: false }, (err, user) => {
      if (err || !user) {
        console.error("Web Google OAuth failed:", err?.message);
        return res.status(401).send("Google sign-in failed.");
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  (req, res) => {
    const token = signAuthToken(toAuthUser(req.user));
    return res.redirect(`/login-success.html?token=${encodeURIComponent(token)}`);
  }
);

// ── Mobile Google OAuth ───────────────────────────────────────────────────────
router.get("/google/mobile", passport.authenticate("google-mobile", {
  scope: ["profile", "email"],
  session: false
}));

router.get("/google/mobile/callback",
  (req, res, next) => {
    passport.authenticate("google-mobile", { session: false }, (err, user) => {
      if (err || !user) {
        console.error("Mobile Google OAuth failed:", err?.message);
        return res.status(401).send("Google sign-in failed.");
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  (req, res) => {
    const token = signAuthToken(toAuthUser(req.user));
    return res.send(`
      <script>
        window.location.href = "safestocker://login?token=${encodeURIComponent(token)}";
      </script>
    `);
  }
);

// ── Email/Password ────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await findShopByCredentials(email, password);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    res.json({ user, token: signAuthToken(user) });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { OwnerName, Email, Password } = req.body;
    if (!OwnerName || !Email || !Password) {
      return res.status(400).json({ error: "All fields required" });
    }

    const user = await createShopWithPassword({ OwnerName, Email, Password });
    res.status(201).json({ user, token: signAuthToken(user) });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    console.error("Signup error:", err);
    res.status(500).json({ error: "Signup failed" });
  }
});

router.get("/user", auth, (req, res) => res.json(req.user));

export default router;
