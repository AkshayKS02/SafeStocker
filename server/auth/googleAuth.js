import GoogleStrategy from "passport-google-oauth20";
import { findOrCreateGoogleShop } from "../services/userService.js";

function makeStrategy(callbackURL, name) {
  return new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL,
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateGoogleShop(profile);
        return done(null, user);
      } catch (err) {
        console.error(`[${name}] OAuth error:`, err);
        return done(err);
      }
    }
  );
}

export default function configureGoogleAuth(passport) {
  const webURL = process.env.GOOGLE_WEB_CALLBACK_URL;
  const mobileURL = process.env.GOOGLE_MOBILE_CALLBACK_URL;

  if (!webURL) console.warn("GOOGLE_WEB_CALLBACK_URL not set");
  if (!mobileURL) console.warn("GOOGLE_MOBILE_CALLBACK_URL not set");

  passport.use("google-web", makeStrategy(webURL, "google-web"));
  passport.use("google-mobile", makeStrategy(mobileURL, "google-mobile"));
}
