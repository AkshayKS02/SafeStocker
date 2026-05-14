# 🛡️ SafeStocker

<div align="center">

### Smart Inventory & Expiry Management System

Reduce stock wastage • Track expiry dates • Generate invoices • Manage inventory smarter

</div>

---

## 📌 Overview

SafeStocker is a full-stack inventory management and expiry tracking platform designed for small retailers, grocery stores, pharmacies, and local businesses.

The system helps businesses:

* 📦 Manage inventory efficiently
* ⏰ Track expiring products
* 💸 Reduce stock losses
* 🧾 Generate invoices instantly
* 📊 Analyze sales & revenue trends
* 🔍 Add products using barcode scanning

Built using a modular frontend architecture with a Node.js + Express backend and PostgreSQL database.

---

## 🚨 Problem Statement

Small businesses often face:

* Manual inventory management
* Expired stock losses
* No expiry alert systems
* Difficult billing workflows
* Poor analytics visibility
* Human errors in stock handling

SafeStocker solves these issues through an intelligent inventory workflow focused on automation, tracking, and usability.

---

## ✨ Features

> Smart inventory, expiry tracking, billing, and stock-loss management platform built for small retailers, grocery stores, pharmacies, and local businesses.

## Overview

SafeStocker is a full-stack inventory management and expiry tracking system designed to help small businesses manage products efficiently, reduce stock wastage, and simplify billing workflows.

The platform combines:

* Barcode-based product onboarding
* Expiry-aware stock tracking
* FIFO stock deduction during billing
* Automated invoice generation
* Real-time dashboard analytics
* Google OAuth + JWT authentication
* Expiry alerts and loss recording

The project is built using a lightweight modular frontend architecture with a Node.js + Express backend and PostgreSQL database.

---

# Problem Statement

Small retailers and pharmacies often struggle with:

* Manual stock tracking
* Expired inventory losses
* Lack of expiry notifications
* Unorganized billing systems
* Difficulty managing growing inventories
* No real visibility into revenue vs losses

SafeStocker solves these problems through an intelligent inventory workflow focused on automation, tracking, and usability.

---

# Key Features

## 1. Authentication System

### Google OAuth Login

* Secure Google authentication using Passport.js
* Separate web and mobile OAuth flows
* JWT token-based session handling
* Persistent login using localStorage

### Email + Password Authentication

* Manual signup/login system
* Shop owner account creation
* Token-based protected routes

### Route Protection

All critical APIs are protected using JWT middleware:

* Inventory routes
* Barcode routes
* Billing routes
* Dashboard routes
* Stock management routes

---

# 2. Barcode-Based Product Entry

## Real-Time Barcode Scanning

SafeStocker supports camera-based barcode scanning directly in the browser.

### Features

* Uses device camera for scanning
* Automatically detects barcode values
* Mobile back-camera prioritization
* Handles permission errors gracefully
* Prevents duplicate scanners from opening

### Barcode Lookup Workflow

After scanning:

1. System first checks local database
2. If not found, product is fetched using OpenFoodFacts API
3. Product preview is shown instantly
4. User can directly add item into inventory

### External API Integration

Integrated with:

* OpenFoodFacts API

Used for:

* Product names
* Brands
* Quantity information

---

# 3. Custom Product Registration

For products unavailable in external APIs:

### Custom Barcode Generator

* Automatically generates unique barcode IDs using timestamps
* Generates barcode preview images dynamically
* Allows creation of completely custom products

### Custom Item Entry

Users can manually enter:

* Product name
* Price
* Barcode
* Category

This is useful for:

* Local products
* Non-packaged goods
* Medical inventory
* Wholesale items

---

# 4. Inventory Management

## Product Management

Users can:

* Add products
* Fetch all registered products
* Prevent duplicate barcode entries
* Store pricing information
* Categorize inventory

## Stock Management

Each product can have:

* Multiple stock batches
* Different expiry dates
* Manufacture dates
* Quantity tracking

### Stock Features

* Add stock entries
* Update quantities
* View active stock only
* Sort stock by expiry
* Sort stock by quantity
* Sort stock alphabetically

---

# 5. Expiry Tracking System

One of the core features of SafeStocker.

## Smart Expiry Monitoring

Stock items are color coded based on freshness:

| Status | Meaning                 |
| ------ | ----------------------- |
| Green  | Fresh stock             |
| Yellow | Expiring soon           |
| Orange | Critical expiry warning |
| Red    | Expired                 |
| Gray   | No expiry information   |

## Expiry Alerts

The application automatically:

* Detects near-expiry products
* Generates alert notifications
* Displays alert dropdown UI
* Highlights affected stock cards
* Redirects users directly to affected inventory

## Expired Stock Handling

Expired stock can be:

* Marked as lost
* Automatically removed from usable inventory
* Recorded inside losses table

### Loss Recording

The system calculates:

* Quantity lost
* Monetary loss amount
* Loss history data

---

# 6. Billing & Invoice System

## Intelligent Billing Workflow

Users can:

* Add products to cart
* Increase/decrease quantities
* View live totals
* Generate invoices instantly

## FIFO Stock Deduction

SafeStocker implements:

### First Expiry First Out (FIFO)

During billing:

* Oldest expiring stock gets deducted first
* Multiple stock batches are handled automatically
* Billing fails safely if stock is insufficient

This minimizes:

* Expired inventory
* Product wastage
* Dead stock accumulation

## PDF Invoice Generation

Invoices are generated dynamically using Puppeteer.

### Invoice Features

* Professional invoice layout
* Productized billing rows
* Quantity & pricing breakdown
* Grand totals
* Browser-streamed PDF download

---

# 7. Dashboard Analytics

SafeStocker includes a live analytics dashboard.

## Dashboard Overview Metrics

Displays:

* Total products
* Total stock quantity
* Today's sales
* Near-expiry stock count

## Revenue Analytics

Graph visualization for:

* Revenue trends
* Loss trends
* Time-based analytics

### Supported Modes

* Weekly analytics
* Monthly analytics
* Yearly analytics

## Recent Orders Panel

Shows:

* Recent receipts
* Billing totals
* Order history

## Biggest Revenue Days

Highlights:

* Top-performing sales days
* Highest revenue periods

---

# 8. Responsive Frontend Architecture

The frontend follows a modular vanilla JavaScript architecture.

## Frontend Modules

### Core Layer

Handles:

* DOM management
* App initialization
* Global state

### Services Layer

Handles:

* API communication
* Billing services
* Item services
* Stock services

### Events Layer

Handles:

* Billing interactions
* Dashboard interactions
* Entry form logic
* Stock events
* Tracking events

### Views Layer

Handles:

* UI rendering
* Dashboard rendering
* Billing rendering
* Tracking cards
* Stock forms

### Alerts Layer

Handles:

* Alert generation
* Alert UI
* Expiry notifications

---

# 9. Security Features

* JWT authentication
* Protected backend APIs
* Authorization middleware
* Duplicate inventory prevention
* Transaction-safe billing operations
* SQL parameterized queries
* Protected invoice generation

---

# 10. Database Design

The backend uses PostgreSQL for persistent storage.

## Main Entities

* Shop
* Items
* Stock
* Billing
* BillingDetails
* Losses
* Categories
* Suppliers

## Data Relationships

The system supports:

* One shop → many items
* One item → many stock batches
* One bill → many billing details
* One stock batch → one loss record

---

# Tech Stack

## Frontend

* HTML5
* CSS3
* Vanilla JavaScript (Modular Architecture)
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

## Authentication

* Google OAuth 2.0
* JWT

## APIs & Libraries

* OpenFoodFacts API
* ZXing Barcode Library
* Puppeteer PDF Engine

---

# Project Structure

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

# API Endpoints

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

| Method | Endpoint                  | Description         |
| ------ | ------------------------- | ------------------- |
| GET    | `/dashboard/overview`     | Dashboard summary   |
| GET    | `/dashboard/biggest-days` | Top revenue days    |
| GET    | `/dashboard/orders`       | Recent orders       |
| GET    | `/dashboard/graph`        | Revenue/loss graphs |

---

# Installation & Setup

## 1. Clone Repository

```bash
git clone https://github.com/yourusername/SafeStocker.git
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
PORT=5000
JWT_SECRET=your_secret_key
DATABASE_URL=your_postgresql_connection
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
```

---

## 5. Start Server

```bash
cd server
npm start
```

---

# Future Improvements

* AI-based expiry prediction
* Supplier management system
* Sales forecasting
* Mobile app version
* QR-based billing
* Multi-shop support
* Cloud sync
* SMS/Email expiry notifications
* Role-based employee access
* Advanced analytics dashboard

---

# Use Cases

SafeStocker can be used in:

* Grocery stores
* Medical shops
* Supermarkets
* Warehouses
* Cosmetic stores
* Retail chains
* Local kirana stores
* FMCG inventory systems

---

# Hackathon Value Proposition

## Why SafeStocker Stands Out

### Real-World Problem Solving

Targets a genuine operational problem faced by small businesses.

### Strong Technical Depth

Combines:

* Authentication
* Computer vision/barcode scanning
* Real-time inventory logic
* Database transactions
* Analytics
* PDF generation
* External API integrations

### Business Impact

Helps reduce:

* Inventory loss
* Human error
* Manual management overhead
* Revenue leakage

### Scalability

Architecture is modular and can evolve into:

* SaaS inventory platform
* Pharmacy management system
* Enterprise warehouse solution

---

# Contributors

Built with passion for smarter inventory management and reduced stock wastage.

---

# License

This project is licensed under the ISC License.
