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
      Email: user.Email
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

router.get("/google",
  (req, res, next) => {
    const platform = req.query.platform === "mobile" ? "mobile" : "web";

    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false,
      state: platform
    })(req, res, next);
  }
);

router.get("/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user, info) => {
      if (err) {
        console.error("Google OAuth callback failed:", {
          message: err.message,
          oauthError: err.oauthError?.data,
          statusCode: err.oauthError?.statusCode,
          info
        });
        return res.status(401).send("Google sign-in failed. Check that GOOGLE_CALLBACK_URL exactly matches the Google OAuth redirect URI.");
      }

      if (!user) {
        console.error("Google OAuth callback returned no user:", info);
        return res.status(401).send("Google sign-in failed.");
      }

      req.user = user;
      return next();
    })(req, res, next);
  },
  (req, res) => {
    const token = signAuthToken(toAuthUser(req.user));
    const isMobile = req.query.state === "mobile";

    if (isMobile) {
      return res.send(`
        <script>
          window.location.href = "safestocker://login?token=${encodeURIComponent(token)}";
        </script>
      `);
    }

    return res.redirect(`/login-success.html?token=${encodeURIComponent(token)}`);
  }
);

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await findShopByCredentials(email, password);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({
      user,
      token: signAuthToken(user)
    });
  } catch (error) {
    console.error("Login error:", error);
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

    res.status(201).json({
      user,
      token: signAuthToken(user)
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.error("Signup error:", error);
    res.status(500).json({ error: "Signup failed" });
  }
});

router.get("/user", auth, (req, res) => {
  res.json(req.user);
});

export default router;
