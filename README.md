# 🛡️ SafeStocker

<div align="center">

### Smart Inventory & Expiry Management Ecosystem

Reduce stock wastage • Track expiry dates • Manage smarter billing • Monitor business insights

</div>

---

# 📌 Overview

SafeStocker is a full-stack inventory management and expiry tracking ecosystem designed for small retailers, grocery stores, pharmacies, warehouses, and local businesses.

The project focuses on reducing inventory losses caused by expired products while simplifying stock management, billing workflows, and business analytics.

SafeStocker currently consists of:

* 🌐 Web Dashboard (already deployed)
* 📱 React Native Mobile Application (in development)
* 🔗 Shared Node.js + PostgreSQL Backend APIs

The platform combines barcode-based product onboarding, expiry-aware stock management, billing automation, analytics dashboards, and intelligent inventory workflows into a unified system.

## 🌐 Deployment

- Live Application: https://safestocker.onrender.com
- Hosting Platform: Render

---

# 🚨 Problem Statement

Small businesses often struggle with:

* Manual inventory tracking
* Expired stock losses
* No automated expiry monitoring
* Difficult billing workflows
* Lack of real-time business analytics
* Human errors during stock handling
* Poor visibility into revenue vs losses

SafeStocker addresses these issues through automation, expiry-focused inventory logic, and a scalable modular architecture.

---

# 🎯 Project Objective

The objective of SafeStocker is to build a scalable inventory ecosystem that helps businesses:

* Reduce product wastage
* Improve inventory visibility
* Simplify billing operations
* Track expiring stock efficiently
* Analyze revenue and losses
* Support both desktop and mobile workflows

The long-term vision is to evolve SafeStocker into a complete SaaS-ready inventory and retail management platform.

---

# ✨ Core Features

## 1. Authentication & Security

### Google OAuth Authentication

* Secure login using Passport.js
* Separate web and mobile OAuth flows
* JWT token-based authentication
* Persistent session handling

### Email & Password Authentication

* Shop owner account registration
* Secure login flow
* Protected API access

### Security Features

* JWT-protected routes
* Authorization middleware
* SQL parameterized queries
* Duplicate inventory prevention
* Transaction-safe billing workflows
* Protected invoice generation

---

# 📦 2. Inventory Management

## Product Management

Users can:

* Add products
* Fetch registered inventory
* Categorize products
* Store pricing information
* Prevent duplicate barcode entries

## Stock Batch Management

Each item supports:

* Multiple stock batches
* Quantity tracking
* Manufacture dates
* Expiry dates
* Batch-wise stock updates

### Stock Operations

* Add stock entries
* Update quantities
* View active stock only
* Sort inventory by:

  * Expiry date
  * Quantity
  * Alphabetical order

---

# 🔍 3. Barcode-Based Product System

## Barcode Scanning Workflow

SafeStocker supports camera-based barcode onboarding directly inside the browser.

### Features

* Real-time barcode scanning using device camera
* Mobile back-camera prioritization
* Duplicate scanner prevention
* Graceful camera permission handling
* Automatic barcode lookup workflow

### Workflow

1. Scan barcode using device camera
2. Check local database first
3. Fetch product details using external APIs if unavailable locally
4. Display product preview
5. Add directly into inventory

### Integrations

* OpenFoodFacts API
* ZXing Barcode Scanner Library

---

# 🏷️ 4. Custom Product Registration

For products unavailable in external APIs:

### Custom Barcode Support

* Timestamp-based barcode generation
* Dynamic barcode preview generation
* Fully custom product creation

### Manual Product Entry

Users can manually define:

* Product name
* Barcode
* Category
* Price

Useful for:

* Local products
* Wholesale inventory
* Medical supplies
* Non-packaged goods

---

# ⏰ 5. Expiry Tracking System

Expiry monitoring is one of the primary features of SafeStocker.

## Smart Expiry Monitoring

Products are color-coded based on freshness:

| Status    | Meaning                 |
| --------- | ----------------------- |
| 🟢 Green  | Fresh stock             |
| 🟡 Yellow | Expiring soon           |
| 🟠 Orange | Critical expiry warning |
| 🔴 Red    | Expired                 |
| ⚪ Gray    | No expiry information   |

## Expiry Alert System

The application automatically:

* Detects near-expiry products
* Generates notifications
* Highlights affected inventory
* Displays alert dropdowns
* Redirects users to affected stock entries

## Expired Stock Handling

Expired inventory can:

* Be marked as lost
* Be removed from active inventory
* Be recorded for analytics

### Loss Tracking

The system records:

* Quantity lost
* Monetary loss amount
* Historical loss analytics

---

# 🧾 6. Billing & Invoice System

## Billing Workflow

Users can:

* Add products to cart
* Adjust quantities
* View live billing totals
* Generate invoices

## FIFO Stock Deduction

SafeStocker follows:

### First Expiry First Out (FIFO)

During billing:

* Oldest-expiring stock is deducted first
* Multiple stock batches are handled automatically
* Billing safely fails if stock is insufficient

This helps minimize:

* Product wastage
* Dead stock accumulation
* Expired inventory losses

## PDF Invoice Generation

Invoices are generated dynamically using Puppeteer.

### Invoice Features

* Professional invoice layout
* Quantity and pricing breakdown
* Browser-streamed PDF download
* Dynamic billing rows
* Grand total calculations

---

# 📊 7. Dashboard Analytics

SafeStocker provides real-time business insights.

## Dashboard Metrics

Displays:

* Total products
* Total stock quantity
* Today's sales
* Near-expiry stock count

## Revenue Analytics

Supports:

* Weekly analytics
* Monthly analytics
* Yearly analytics

### Graph Visualizations

* Revenue trends
* Loss trends
* Sales analytics

## Order History

* Recent receipts
* Billing totals
* Purchase history

## Revenue Insights

Highlights:

* Top-performing sales days
* High-revenue periods

---

# 📱 Mobile Expansion (Work in Progress)

A separate React Native mobile application is currently being explored as an extension of the SafeStocker ecosystem.

The mobile application is being developed in a separate repository and is currently in early development stages.

---

# 🧱 9. Frontend Architecture

The frontend follows a modular architecture for scalability and maintainability.

## Core Modules

### Core Layer

Handles:

* App initialization
* Global state management
* DOM utilities

### Services Layer

Handles:

* API communication
* Billing services
* Inventory services
* Stock services

### Events Layer

Handles:

* Billing events
* Dashboard interactions
* Form logic
* Stock operations

### Views Layer

Handles:

* UI rendering
* Dashboard rendering
* Billing screens
* Inventory cards

### Alerts Layer

Handles:

* Expiry notifications
* Alert generation
* Alert rendering

---

# 🗄️ 10. Database Design

SafeStocker uses PostgreSQL for persistent storage.

## Main Database Entities

* Shop
* Items
* Stock
* Billing
* BillingDetails
* Losses
* Categories
* Suppliers

## Relationships

* One shop → many items
* One item → many stock batches
* One bill → many billing details
* One stock batch → one loss record

---

# ⚙️ Tech Stack

## Frontend

* HTML5
* CSS3
* Vanilla JavaScript
* ZXing Barcode Scanner
* Chart.js

## Backend

* Node.js
* Express.js
* Passport.js
* JWT Authentication
* Puppeteer

## Database

* PostgreSQL

## APIs & Libraries

* OpenFoodFacts API
* ZXing Barcode Library
* Puppeteer PDF Engine

---

# 🧩 Project Structure

```bash
SafeStocker/
│
├── client/
│   ├── public/
│   └── src/
│       ├── alerts/
│       ├── auth/
│       ├── barcode/
│       ├── core/
│       ├── events/
│       ├── nav/
│       ├── services/
│       └── views/
│
├── mobile/
│   ├── src/
│   ├── screens/
│   ├── components/
│   └── services/
│
├── server/
│   ├── auth/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── static/
│   └── templates/
│
└── README.md
```

---

# 🔌 API Endpoints

## Authentication

| Method | Endpoint       | Description              |
| ------ | -------------- | ------------------------ |
| GET    | `/auth/google` | Google OAuth login       |
| POST   | `/auth/login`  | Email login              |
| POST   | `/auth/signup` | Create account           |
| GET    | `/auth/user`   | Fetch authenticated user |

## Barcode

| Method | Endpoint   | Description          |
| ------ | ---------- | -------------------- |
| POST   | `/barcode` | Scan & fetch product |

## Items

| Method | Endpoint | Description    |
| ------ | -------- | -------------- |
| GET    | `/items` | Fetch products |
| POST   | `/items` | Add product    |

## Stock

| Method | Endpoint                 | Description                |
| ------ | ------------------------ | -------------------------- |
| GET    | `/stock`                 | Fetch stock                |
| POST   | `/stock`                 | Add stock                  |
| PUT    | `/stock/:stockID`        | Update quantity            |
| DELETE | `/stock/expire/:stockID` | Mark expired stock as lost |

## Billing

| Method | Endpoint   | Description          |
| ------ | ---------- | -------------------- |
| POST   | `/invoice` | Generate invoice PDF |

## Dashboard

| Method | Endpoint                  | Description            |
| ------ | ------------------------- | ---------------------- |
| GET    | `/dashboard/overview`     | Dashboard summary      |
| GET    | `/dashboard/biggest-days` | Top revenue days       |
| GET    | `/dashboard/orders`       | Recent orders          |
| GET    | `/dashboard/graph`        | Revenue/loss analytics |

---

# 🌐 Deployment

SafeStocker backend services are hosted on Render.

### Deployment Features

* Production-hosted Node.js backend
* Live PostgreSQL integration
* Shared API architecture
* Cloud deployment workflow
* Browser-accessible web dashboard

### Platform Used

* Render (Backend Hosting)

### Live Application
https://safestocker.onrender.com

---

# 🚀 Installation & Setup

## 1. Clone Repository

```bash
git clone https://github.com/AkshayKS02/SafeStocker.git
cd SafeStocker
```

---

## 2. Install Backend Dependencies

```bash
cd server
npm install
```

---

## 3. Install Frontend Dependencies

```bash
cd ../client
npm install
```

---

## 4. Configure Environment Variables

Create a `.env` file inside `/server`

```env
# Server
PORT=5000

# Authentication
JWT_SECRET=your_jwt_secret

# Database
DATABASE_URL=your_postgresql_connection

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_WEB_CALLBACK_URL=http://localhost:5000/auth/google/web/callback
GOOGLE_MOBILE_CALLBACK_URL=http://localhost:5000/auth/google/mobile/callback
```

> Replace all placeholder values with your actual credentials before running the project.

---

## 5. Start Backend Server

```bash
cd server
npm start
```

---

# 🌍 Use Cases

SafeStocker can be used in:

* Grocery stores
* Medical shops
* Retail chains
* Warehouses
* Cosmetic stores
* Supermarkets
* FMCG inventory systems
* Local kirana stores

---

# 🔮 Future Improvements

Planned future features include:

* AI-based expiry prediction
* Supplier management system
* Sales forecasting
* Multi-shop support
* QR-based billing
* Cloud synchronization
* SMS/Email expiry notifications
* Role-based employee access
* Advanced analytics dashboards
* Offline-first mobile support

---

# 👨‍💻 Contributors

Built with a focus on smarter inventory management, reduced stock wastage, and scalable business workflows.

---

# 📄 License

This project is licensed under the ISC License.
