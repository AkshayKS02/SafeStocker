# 📱 SafeStocker Mobile

**Smart Inventory & Expiry Management — Mobile Application**

Scan products • Track expiry dates • Generate invoices • Monitor business insights — all from your phone.

---

## 📌 Overview

SafeStocker Mobile is the React Native companion to the SafeStocker ecosystem. It extends the web dashboard experience into a fully mobile-native application, allowing shop owners to manage inventory, scan barcodes, bill customers, and monitor analytics directly from an Android or iOS device.

The mobile app shares the same Node.js + PostgreSQL backend as the web dashboard and communicates through a common REST API layer.

---

## 🌐 Backend

The mobile app connects to the same live backend used by the web dashboard.

| Property | Value |
|---|---|
| Live API | `https://safestocker.onrender.com` |
| Hosting | Render |
| Database | PostgreSQL (Supabase) |

---

## ✨ Features

### 🔐 Authentication
- Email & password login and registration
- Google OAuth (mobile flow via `expo-web-browser`)
- JWT token stored securely using `expo-secure-store`
- Persistent login sessions across app restarts
- Deep link callback handling (`safestocker://login`)

### 📦 Inventory Management
- View all registered products grouped by category
- Add new products via barcode scan or manual entry
- Custom barcode generation for unregistered products
- Category assignment on product creation (pulled from DB)
- Add stock batches with manufacture and expiry dates
- FIFO-aware stock tracking

### 🔍 Barcode Scanner
- Real-time camera barcode scanning
- Automatic product lookup against your inventory
- Falls back to OpenFoodFacts API for unknown barcodes
- Clear found / not-found / new-product flow
- Supports EAN-13, UPC-A, CODE128, and more

### ⏰ Expiry Tracking
- Category cards showing product counts
- Per-category product list with expiry-aware colour coding:
  - 🟢 Fresh
  - 🟡 Expiring Soon (≤ 7 days)
  - 🟠 Critical (≤ 3 days)
  - 🔴 Expired
- Sort by expiry date, name, quantity
- Search within categories
- Pull-to-refresh

### 🧾 Billing & Invoices
- Product search and cart builder
- Quantity-capped to available stock
- Live cart total
- One-tap bill generation
- FIFO stock deduction on the server
- PDF invoice generated on-device via `expo-print`
- Share sheet via `expo-sharing` (WhatsApp, email, save, etc.)

### 📊 Dashboard Analytics
- Total products, stock units, today's sales, near-expiry count
- Revenue bar chart (Hours / Days / Months filter)
- Recent orders list (last 5)
- Top revenue days (last 5)

### 👤 Profile & Suppliers
- Account details view
- Notification preference toggle
- Supplier management (add / delete, max 10)
- Phone number validation + duplicate detection

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.81 + Expo SDK 54 |
| Navigation | Expo Router (file-based) |
| Language | TypeScript |
| State | React Context API |
| HTTP | Axios |
| Auth Storage | expo-secure-store |
| Camera | expo-camera |
| PDF | expo-print + expo-sharing |
| Barcode SVG | jsbarcode + react-native-svg |
| OAuth Browser | expo-web-browser |
| Date Picker | @react-native-community/datetimepicker |

---

## 🗂️ Project Structure

```
SafeStocker-Mobile/
│
├── app/                        # Expo Router screens (file-based routes)
│   ├── (tabs)/                 # Main tab screens
│   │   ├── home.tsx            # Landing / marketing screen
│   │   ├── scan.tsx            # Barcode scanner + product creation
│   │   ├── custom.tsx          # Manual / custom product creation
│   │   ├── add_stock.tsx       # Add stock to existing product
│   │   ├── track.tsx           # Category cards + expiry tracking
│   │   ├── billing.tsx         # Billing cart + invoice generation
│   │   ├── dashboard.tsx       # Analytics dashboard
│   │   ├── profile.tsx         # Account + supplier management
│   │   └── _layout.tsx         # Tab navigator layout
│   ├── auth/
│   │   ├── login.tsx           # Email / Google login
│   │   ├── signup.tsx          # Account registration
│   │   └── _layout.tsx         # Auth stack layout
│   ├── services/
│   │   └── api.ts              # Axios instance with JWT interceptor
│   ├── _layout.tsx             # Root layout + providers
│   └── index.tsx               # Splash + auth redirect
│
├── context/
│   ├── AuthContext.tsx         # User session + token management
│   └── InventoryContext.tsx    # Products, stock, invoice operations
│
├── hooks/
│   └── useCategories.ts        # Fetches categories from DB
│
├── components/
│   ├── ExpiryCard.tsx          # Stock item card with expiry status
│   ├── BillingProductCard.tsx  # Billing screen product row
│   ├── HeroCarousel.tsx        # Home screen carousel
│   ├── FeaturesList.tsx        # Home screen features
│   └── HowItWorks.tsx          # Home screen steps
│
├── services/
│   └── safeFetch.ts            # Native fetch wrapper (utility)
│
├── assets/
│   └── images/                 # App icons, splash, store images
│
├── .env                        # Environment variables (not committed)
├── app.json                    # Expo configuration
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed before proceeding:

| Tool | Version | Download |
|---|---|---|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | Included with Node |
| Expo CLI | Latest | `npm install -g expo-cli` |
| Git | Any | https://git-scm.com |
| Android Studio | Latest | For Android emulator |
| Expo Go app | Latest | Play Store / App Store |

---

### Step 1 — Clone the repository

```bash
git clone https://github.com/AkshayKS02/SafeStocker.git
cd SafeStocker/SafeStocker-Mobile
```

---

### Step 2 — Install dependencies

```bash
npm install
```

---

### Step 3 — Configure environment variables

Create a `.env` file in the root of `SafeStocker-Mobile/`:

```env
EXPO_PUBLIC_API_URL=https://safestocker.onrender.com
```

> **Note:** The `EXPO_PUBLIC_` prefix is required by Expo to expose variables to the client bundle.

If you are running the backend locally instead of using the live server:

```env
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:5000
```

Replace `YOUR_LOCAL_IP` with your machine's local network IP (e.g. `192.168.1.10`).  
Do **not** use `localhost` — physical devices and emulators cannot reach it.

To find your local IP:
- **Windows:** Run `ipconfig` in Command Prompt → look for `IPv4 Address`
- **macOS/Linux:** Run `ifconfig` or `ip addr`

---

### Step 4 — Start the development server

```bash
npx expo start
```

This opens the Expo Developer Tools in your terminal.

---

### Step 5 — Run on a device or emulator

#### Option A — Physical device (recommended)

1. Install **Expo Go** from the Play Store or App Store
2. Make sure your phone and computer are on the **same Wi-Fi network**
3. Scan the QR code shown in the terminal using Expo Go

#### Option B — Android emulator

1. Open Android Studio → open AVD Manager → start a virtual device
2. In the Expo terminal press `a` to launch on Android emulator

#### Option C — iOS simulator (macOS only)

1. Install Xcode from the Mac App Store
2. In the Expo terminal press `i` to launch on iOS simulator

---

### Step 6 — Build a native Android APK (optional)

To generate a standalone `.apk` for testing on a real device without Expo Go:

```bash
npx expo run:android
```

> This requires Android Studio and a connected device or running emulator.

For a production build using EAS:

```bash
npm install -g eas-cli
eas build --platform android --profile preview
```

---

## 🔌 API Endpoints Used

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/login` | Email login |
| `POST` | `/auth/signup` | Register account |
| `GET` | `/auth/user` | Fetch current user |
| `GET` | `/auth/google/mobile` | Google OAuth (mobile) |
| `POST` | `/barcode` | Barcode product lookup |
| `GET` | `/items` | Fetch all products |
| `POST` | `/items` | Create new product |
| `GET` | `/stock` | Fetch all stock batches |
| `POST` | `/stock` | Add stock batch |
| `PUT` | `/stock/:stockID` | Update stock quantity |
| `DELETE` | `/stock/:stockID` | Remove stock batch |
| `DELETE` | `/stock/expire/:stockID` | Mark expired stock as loss |
| `POST` | `/invoice/mobile` | Create bill (returns JSON) |
| `GET` | `/categories` | Fetch all categories |
| `GET` | `/dashboard/overview` | Summary stats |
| `GET` | `/dashboard/orders` | Recent orders |
| `GET` | `/dashboard/biggest-days` | Top revenue days |
| `GET` | `/dashboard/graph` | Revenue/loss graph data |

---

## 🔑 Google OAuth Setup (optional)

The app supports Google sign-in via the mobile OAuth flow. To use it:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or open your project
3. Under **Credentials**, create an **OAuth 2.0 Client ID** for Web application
4. Add the following to your backend `.env`:

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_MOBILE_CALLBACK_URL=https://your-backend.onrender.com/auth/google/mobile/callback
```

5. The mobile callback redirects to `safestocker://login?token=...` which is handled by the deep link listener in `app/_layout.tsx`

---

## ⚠️ Common Issues

| Issue | Fix |
|---|---|
| `Network request failed` | Make sure `EXPO_PUBLIC_API_URL` is set correctly and the device is on the same network as the backend |
| `Unable to activate keep awake` | Harmless warning on Android emulator only — does not affect physical devices |
| Barcode scanner not working | Camera permission must be granted; test on physical device, not emulator |
| Google login stuck in browser | Ensure the backend `/auth/google/mobile/callback` redirects with `res.redirect()` not a JS script |
| Categories not loading | Backend must be deployed with the `/categories` endpoint — redeploy if recently updated |
| PDF share sheet not opening | `expo-sharing` is not available on all emulators — test on physical device |

---

## 📄 License

This project is licensed under the ISC License.
