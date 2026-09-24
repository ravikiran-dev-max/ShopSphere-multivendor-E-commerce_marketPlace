# SHOPSPHERE - Enterprise Multi-Vendor E-Commerce Marketplace

**ShopSphere** is a production-grade, highly scalable multi-vendor e-commerce marketplace platform built on the modern MERN stack (**Node.js**, **Express.js**, **MongoDB Atlas / Mongoose**, **React 19**, **Vite**, **Tailwind CSS v4**, **Zustand**, and **Zod**).

The system features multi-vendor shopping cart capabilities, automatic order splitting across independent sellers, strict Role-Based Access Control (RBAC), real-time inventory management, automated vendor payout reconciliation, and AI-powered merchant insights.

---

## 🚀 Key Platform Features

### 🛒 Customer Marketplace
- **Multi-Vendor Cart & Checkout**: Single checkout experience supporting items from multiple sellers. Automatically splits parent orders into vendor-specific sub-orders (`ORD-1001-A`, `ORD-1001-B`).
- **Catalog Search & Filtering**: Full-text product search, category trees, price range filters, ratings, and instant sorting.
- **Wishlist & Saved Items**: Customer wishlist management.
- **Order Tracking**: Real-time status updates per sub-order (`PLACED` ➔ `CONFIRMED` ➔ `PACKED` ➔ `SHIPPED` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`).

### 🏬 Merchant Seller System
- **Vendor Portal**: Isolated merchant dashboard for managing store branding, bank payout details, and product catalog.
- **Inventory Control**: Real-time stock reservation, low-stock threshold alerts, and inventory history logs.
- **Sub-Order Fulfillment**: Update order fulfillment statuses with state machine validation preventing illegal state jumps.
- **AI Seller Assistant**: Automated product description generation using smart heuristics.

### 🛡️ Platform Admin & RBAC
- **Strict Role-Based Access Control**: Server-verified RBAC for 5 roles (`ADMIN`, `SELLER`, `CUSTOMER`, `SUPPORT`, `DELIVERY`).
- **Vendor Moderation**: Review and approve/reject/suspend seller store applications.
- **User Management**: Activate, deactivate, or suspend accounts with security audit logging.
- **Platform Analytics**: Total revenues, order volumes, top sellers, and low-stock alerts.

### 🎧 Support & Delivery
- **Support Ticket System**: Threaded help desk messaging between customers, support agents, and admins.
- **Delivery Partner Dashboard**: Assigned package logistics and proof of delivery tracking.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite 6, Tailwind CSS v4, Zustand, Axios, React Hook Form, Zod, Framer Motion, React Icons.
- **Backend**: Node.js, Express.js, MongoDB Atlas / Mongoose, JWT (Access Tokens + HttpOnly Refresh Cookies), bcryptjs, Helmet, CORS, express-rate-limit, express-mongo-sanitize, hpp.

---

## 📂 Project Architecture

```
ShopSphere/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB Atlas Connection
│   │   ├── controllers/     # Auth, User, Seller, Product, Cart, Order, Admin, AI
│   │   ├── middleware/      # JWT Authentication & RBAC Authorization
│   │   ├── models/          # 24 Mongoose Schemas (User, Order, SellerOrder, Product, etc.)
│   │   ├── routes/          # RESTful Endpoint Routers
│   │   ├── utils/           # ApiError, ApiResponse, asyncHandler, Seed Script
│   │   ├── validators/      # Zod Validation Schemas
│   │   ├── app.js           # Express App Configuration & Security Middlewares
│   │   └── server.js        # Main Server Entry Point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/      # Common UI (Button, Input, Badge, Modal, Loader, Navbar, Sidebar)
    │   ├── layouts/         # CustomerLayout, AdminLayout, SellerLayout
    │   ├── pages/           # Home, Products, ProductDetails, Cart, Checkout, Orders, Dashboards
    │   ├── routes/          # ProtectedRoute & AppRoutes
    │   ├── services/        # Axios API Client with Auto Token Refresh
    │   └── store/           # Zustand Auth Store
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## ⚡ Quick Start & Setup Guide

### 1. Environment Configuration

#### Backend Environment (`backend/.env`):
Create `backend/.env` (copy from `backend/.env.example`):
```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection String
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/shopsphere?retryWrites=true&w=majority

CLIENT_URL=http://localhost:5173

JWT_ACCESS_SECRET=shopsphere_jwt_access_secret_super_secure_key_12345
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_SECRET=shopsphere_jwt_refresh_secret_super_secure_key_67890
JWT_REFRESH_EXPIRY=7d
```

### 2. Install Dependencies

#### Backend:
```bash
cd backend
npm install
```

#### Frontend:
```bash
cd frontend
npm install
```

### 3. Seed Database with Demo Accounts & Catalog

Run the database seed script to populate demo accounts, categories, products, inventory, and coupons:

```bash
cd backend
node src/utils/seed.js
```

#### 🔑 Demo Accounts Generated:
| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@shopsphere.dev` | `Admin@123456` | Platform Administrator |
| **SELLER 1** | `seller1@shopsphere.dev` | `Seller@123456` | Approved Merchant (Apex Tech Store) |
| **SELLER 2** | `seller2@shopsphere.dev` | `Seller@123456` | Approved Merchant (Nova Apparel) |
| **CUSTOMER** | `customer@shopsphere.dev` | `Customer@123456` | Marketplace Buyer |
| **SUPPORT** | `support@shopsphere.dev` | `Support@123456` | Customer Support Agent |
| **DELIVERY** | `delivery@shopsphere.dev` | `Delivery@123456` | Delivery Rider |

---

### 4. Run Development Servers

#### Start Backend API Server:
```bash
cd backend
npm run dev
```
Backend running at: `http://localhost:5000`  
Health Check: `http://localhost:5000/api/v1/health`

#### Start Frontend Client:
```bash
cd frontend
npm run dev
```
Frontend running at: `http://localhost:5173`

---

## 🌐 Production Deployment Guide

### 1. MongoDB Atlas Setup
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and whitelist network access (`0.0.0.0/0` for cloud deployment).
3. Copy your MongoDB Atlas SRV connection string into `MONGO_URI` in your backend environment variables.

### 2. Deploying Backend (Render / Railway / AWS)
1. Push backend code to GitHub.
2. Create a Web Service on Render or Railway.
3. Set Environment Variables (`PORT`, `MONGO_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`, `NODE_ENV=production`).
4. Set Build Command: `npm install`
5. Set Start Command: `node src/server.js`

### 3. Deploying Frontend (Vercel / Netlify)
1. Import `frontend` project into Vercel or Netlify.
2. Set Build Command: `npm run build`
3. Set Output Directory: `dist`
4. Set Environment Variable `VITE_API_URL` to your live backend domain (e.g. `https://shopsphere-api.onrender.com/api/v1`).

---

## 🔒 Security Best Practices Implemented

- **Password Hashing**: Salting and hashing via `bcryptjs`.
- **JWT Architecture**: Short-lived access tokens (15 mins) + HttpOnly, Secure, SameSite refresh cookies (7 days).
- **Session Revocation**: Database token rotation preventing token reuse attacks.
- **NoSQL Injection Protection**: `express-mongo-sanitize` strips operator characters (`$`, `.`).
- **HTTP Parameter Pollution**: Protected using `hpp`.
- **Rate Limiting**: `express-rate-limit` caps requests per IP window.
- **CORS Whitelist**: Production origin validation.

---

## 📜 License
This project is open source under the ISC License. Built for production marketplace applications.
