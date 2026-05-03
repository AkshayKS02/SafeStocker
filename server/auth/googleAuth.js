import GoogleStrategy from "passport-google-oauth20";
import { findOrCreateGoogleShop } from "../services/userService.js";

export default function configureGoogleAuth(passport) {
  const googleCallbackURL = process.env.GOOGLE_CALLBACK_URL;

  if (!googleCallbackURL) {
    console.warn("GOOGLE_CALLBACK_URL is not set. Google OAuth will fail until it matches your Google Console redirect URI.");
  }

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: googleCallbackURL,
    proxy: true
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const picture = profile.photos?.[0]?.value;
      console.log('[Google OAuth] Picture from profile:', picture ? 'found' : 'not found');
      const user = await findOrCreateGoogleShop(profile);
      return done(null, user);
    } catch (err) {
      console.error("OAuth error:", err);
      return done(err);
    }
  }));
}
