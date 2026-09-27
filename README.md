# ⚡ InvenFlow — Inventory Management System

A full-stack inventory management system built with React, Node.js, Express, and MongoDB. Features a modern dark UI, real-time notifications, shopping cart, order management, and role-based access control.

🔗 **Live Demo:** https://inven-flow-mu.vercel.app

---

## 🚀 Features

### Dashboard
- Animated stat cards (Total Products, Stock, Value, Low Stock)
- Weekly activity bar chart (stock in/out)
- Category distribution pie chart
- Quick actions panel
- Real-time activity feed

### Inventory Management
- Full CRUD for products with SKU, category, pricing
- Stock In / Stock Out / Adjust operations
- Low stock alerts and notifications
- Stock transaction history with timeline

### Shop & Orders
- Public product browsing with category filters
- Add to cart with quantity selector
- 2-step checkout (Shipping + Payment)
- Order tracking with status timeline (Confirmed → Shipped → Delivered)
- Order cancellation with automatic stock restoration

### Authentication & Users
- JWT-based authentication
- Role-based access: Admin / Staff
- User management (activate/deactivate accounts)
- Secure password hashing with bcryptjs

### Notifications
- Real-time notification bell (polls every 30s)
- Events: login, register, purchase, delete product, low stock
- Activity log with timeline view

### Settings
- Profile editing
- Password change
- Notification preferences
- Appearance settings

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, GSAP |
| Charts | Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas |

---

## 📁 Project Structure

inventory-system/
├── backend/
│ ├── config/ # Database seed
│ ├── controllers/ # Business logic
│ ├── middleware/ # Auth, error handling
│ ├── models/ # Mongoose schemas
│ ├── routes/ # API routes
│ └── server.js # Entry point
└── frontend/
└── src/
├── components/ # Layout, Cart, Notifications, Modals
├── context/ # Auth, Cart, Notification state
└── pages/ # Dashboard, Products, Shop, Orders, etc.


---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- MongoDB (local) or MongoDB Atlas account

### Backend

```bash
cd inventory-system/backend
npm install
```

Create `.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/inventory_db
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

```bash
npm run seed    # populate sample data
npm run dev     # start backend on :5000
```

### Frontend

```bash
cd inventory-system/frontend
npm install
npm run dev     # start frontend on :5173
```

Open `http://localhost:5173`

---

## 🌐 Deployment

| Service | Purpose | URL |
|---------|---------|-----|
| Vercel | React frontend | inven-flow-mu.vercel.app |
| Render | Node.js API | invenflow.onrender.com |
| MongoDB Atlas | Cloud database | cloud.mongodb.com |

### Render Environment Variables

NODE_ENV = production
PORT = 5000
MONGO_URI = your Atlas connection string
JWT_SECRET = your secret key
JWT_EXPIRES_IN = 7d
CLIENT_URL = https://inven-flow-mu.vercel.app

### Vercel Environment Variables
VITE_API_URL = https://invenflow.onrender.com/api


---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/login | No | Login |
| POST | /api/auth/register | No | Register |
| GET | /api/products | Yes | List products |
| POST | /api/products | Admin/Staff | Create product |
| PUT | /api/products/:id | Admin/Staff | Update product |
| DELETE | /api/products/:id | Admin | Delete product |
| POST | /api/stock/in | Admin/Staff | Add stock |
| POST | /api/stock/out | Admin/Staff | Remove stock |
| GET | /api/stock/transactions | Yes | Transaction history |
| POST | /api/orders | Yes | Place order |
| GET | /api/orders/my | Yes | My orders |
| GET | /api/dashboard/stats | Yes | Dashboard data |
| GET | /api/notifications | Yes | Notifications |

---

## 📸 Screenshots

> Dashboard · Products · Shop · Orders · Activity Log

---

## 👨‍💻 Author

**Jwala Singh**
MCA Student — Galgotias University

[![GitHub](https://img.shields.io/badge/GitHub-Jwala999-black?logo=github)](https://github.com/Jwala999)

---

## 📄 License

MIT License — free to use and modify.
