import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import db from './config/db.js';

import barcodeRoutes from './routes/barcodeRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import auth from './middleware/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: true,
  credentials: false,
}));

app.use(express.json());
app.set('trust proxy', 1);

app.use(express.static(path.join(__dirname, '../client/public')));
app.use('/src', express.static(path.join(__dirname, '../client/src')));
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/templates', express.static(path.join(__dirname, 'templates')));

app.use(passport.initialize());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails[0].value;
      const name = profile.displayName;
      const picture = profile.photos?.[0]?.value || '';

      try {
        const result = await db.query(
          'SELECT "ShopID","OwnerName","Email" FROM shop WHERE "Email" = $1',
          [email]
        );

        if (result.rows.length > 0) {
          return done(null, {
            ...result.rows[0],
            picture,
          });
        }

        const phone = '9' + Math.floor(100000000 + Math.random() * 900000000);
        const insert = await db.query(
          'INSERT INTO shop ("OwnerName","Phone","Email") VALUES ($1,$2,$3) RETURNING *',
          [name, phone, email]
        );

        return done(null, {
          ...insert.rows[0],
          picture,
        });
      } catch (err) {
        console.error('OAuth error:', err);
        return done(err);
      }
    }
  )
);

app.get('/auth/google', 
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const user = req.user;
    const token = jwt.sign(
      {
        ShopID: user.ShopID,
        OwnerName: user.OwnerName,
        Email: user.Email,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userAgent = req.headers['user-agent'] || '';
    const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);

    if (isMobile) {
      return res.send(`
        <html>
          <head>
            <script>
              window.location.href = 'safestocker://login?token=${encodeURIComponent(token)}';
            </script>
          </head>
          <body>
            <p>Redirecting to SafeStocker...</p>
          </body>
        </html>
      `);
    }

    return res.redirect(`/login-success?token=${token}`);
  }
);

app.get('/login-success', (req, res) => {
  const token = req.query.token;
  res.send(`
    <html>
      <head>
        <title>SafeStocker - Login Success</title>
      </head>
      <body>
        <script>
          const token = '${token}';
          localStorage.setItem('auth_token', token);
          window.location.href = '/';
        </script>
      </body>
    </html>
  `);
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await db.query(
      'SELECT "ShopID","OwnerName","Email","Password" FROM shop WHERE "Email" = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const hashedInput = crypto.createHash('sha256').update(password).digest('hex');
    const passwordMatch = hashedInput === user.Password;

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        ShopID: user.ShopID,
        OwnerName: user.OwnerName,
        Email: user.Email,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        ShopID: user.ShopID,
        OwnerName: user.OwnerName,
        Email: user.Email,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/auth/signup', async (req, res) => {
  try {
    const { OwnerName, Email, Password } = req.body;

    if (!OwnerName || !Email || !Password) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const existing = await db.query(
      'SELECT "ShopID" FROM shop WHERE "Email" = $1',
      [Email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = crypto.createHash('sha256').update(Password).digest('hex');
    const phone = '9' + Math.floor(100000000 + Math.random() * 900000000);

    const result = await db.query(
      'INSERT INTO shop ("OwnerName","Phone","Email","Password") VALUES ($1,$2,$3,$4) RETURNING "ShopID","OwnerName","Email"',
      [OwnerName, phone, Email, hashedPassword]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      {
        ShopID: user.ShopID,
        OwnerName: user.OwnerName,
        Email: user.Email,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

app.get('/auth/user', auth, (req, res) => {
  res.json(req.user);
});

app.use('/barcode', auth, barcodeRoutes);
app.use('/items', auth, itemRoutes);
app.use('/stock', auth, stockRoutes);
app.use('/invoice', auth, invoiceRoutes);
app.use('/dashboard', auth, dashboardRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});