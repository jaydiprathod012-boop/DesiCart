# 🛒 DesiCart — Full-Stack MERN E-Commerce

> India's favourite online shopping experience — built with MongoDB, Express.js, React + Vite, and Node.js.

---

## 📸 Features at a Glance

| Feature | Details |
|---|---|
| 🏠 Home Page | Hero banner, categories, featured products, promo banners |
| 🛍️ Product Listing | Filters (category, price, rating), search, pagination, sort |
| 📦 Product Detail | Image gallery, reviews, add to cart, buy now |
| 🛒 Cart | Add/remove/update qty, persistent per user |
| 💳 Checkout | Address form, Razorpay (test) + COD, order summary |
| 👤 Auth | JWT login/signup, role-based (user/admin), bcrypt passwords |
| 📊 Dashboard | My orders (with status tracker), profile edit |
| ⚙️ Admin Panel | Product CRUD, order management, stats |
| 🔍 Search | Full-text MongoDB search |
| 📸 Image Upload | Cloudinary CDN |
| 📄 Pagination | Server-side, all listing pages |

---

## 🏗️ Project Structure

```
desicart/
├── backend/                    # Node.js + Express API
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── cloudinary.js      # Cloudinary config
│   ├── controllers/
│   │   ├── authController.js  # Register, login, profile
│   │   ├── productController.js # CRUD + search + reviews
│   │   ├── cartController.js  # Cart management
│   │   ├── orderController.js # Order placement + tracking
│   │   └── paymentController.js # Razorpay integration
│   ├── middleware/
│   │   ├── auth.js            # JWT protect + authorize
│   │   ├── errorHandler.js    # Global error handler
│   │   └── upload.js          # Multer + Cloudinary
│   ├── models/
│   │   ├── User.js            # User schema (bcrypt)
│   │   ├── Product.js         # Product + reviews schema
│   │   ├── Order.js           # Order schema
│   │   └── Cart.js            # Cart schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── uploadRoutes.js
│   ├── data/
│   │   └── seeder.js          # Sample data + demo users
│   ├── server.js              # Entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/                   # React + Vite
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── ProductCard.jsx
    │   │   │   ├── ProtectedRoute.jsx
    │   │   │   └── AdminRoute.jsx
    │   │   └── layout/
    │   │       ├── Navbar.jsx
    │   │       └── Footer.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx  # Global auth state
    │   │   └── CartContext.jsx  # Global cart state
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── ProductsPage.jsx
    │   │   ├── ProductDetail.jsx
    │   │   ├── CartPage.jsx
    │   │   ├── CheckoutPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── SignupPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── OrderDetailPage.jsx
    │   │   ├── NotFound.jsx
    │   │   └── admin/
    │   │       ├── AdminDashboard.jsx
    │   │       ├── AdminProducts.jsx
    │   │       └── AdminOrders.jsx
    │   ├── utils/
    │   │   └── api.js          # Axios client with JWT
    │   ├── App.jsx             # Route definitions
    │   ├── main.jsx            # App entry point
    │   └── index.css           # Global design system
    ├── index.html
    ├── vite.config.js
    ├── .env.example
    └── package.json
```

---

## ⚡ Quick Start (Step-by-Step)

### Prerequisites
- **Node.js** v18+ → https://nodejs.org
- **MongoDB** (local or Atlas) → https://www.mongodb.com
- **Git** (optional)

---

### Step 1 — Clone / Extract the Project

```bash
# If using git:
git clone <repo-url> desicart
cd desicart

# Or just extract the zip and open the folder
```

---

### Step 2 — Set Up the Backend

```bash
cd backend

# Install dependencies
npm install

# Copy the example env file and fill it in
cp .env.example .env
```

Now open `backend/.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development

# ── MongoDB ──────────────────────────────────────────────────
# Option A: Local MongoDB (if installed)
MONGO_URI=mongodb://localhost:27017/desicart

# Option B: MongoDB Atlas (cloud, free tier)
# 1. Go to https://cloud.mongodb.com → Create free cluster
# 2. Get connection string → replace below:
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/desicart

# ── JWT ──────────────────────────────────────────────────────
JWT_SECRET=replace_this_with_any_long_random_string_like_abc123xyz789
JWT_EXPIRE=30d

# ── Cloudinary (Image Uploads) ───────────────────────────────
# 1. Go to https://cloudinary.com → Sign up free
# 2. Dashboard → copy Cloud Name, API Key, API Secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ── Razorpay (Payments — Test Mode) ─────────────────────────
# 1. Go to https://razorpay.com → Sign up
# 2. Settings → API Keys → Generate Test Keys
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_test_secret

# ── Frontend URL ─────────────────────────────────────────────
CLIENT_URL=http://localhost:5173
```

---

### Step 3 — Seed the Database

```bash
# From the backend/ folder:
npm run seed

# ✅ This creates:
#   - 12 sample products (electronics, clothing, food, etc.)
#   - Admin user:  admin@desicart.in / admin123
#   - Demo user:   user@desicart.in  / user1234

# To clear the database:
npm run seed -- --destroy
```

---

### Step 4 — Start the Backend Server

```bash
# Development mode (auto-restarts on file changes):
npm run dev

# Production mode:
npm start
```

You should see:
```
✅ MongoDB Connected: localhost
🚀 DesiCart Server running on http://localhost:5000
📦 Environment: development
```

Test it at: http://localhost:5000/api/health

---

### Step 5 — Set Up the Frontend

```bash
# Open a NEW terminal tab/window
cd ../frontend

# Install dependencies
npm install

# Copy env file (no changes needed for local dev)
cp .env.example .env
```

---

### Step 6 — Start the Frontend

```bash
npm run dev
```

You should see:
```
  VITE v5.x  ready in 300 ms
  ➜  Local:   http://localhost:5173/
```

🎉 Open **http://localhost:5173** in your browser!

---

## 🔑 Demo Credentials

| Role  | Email                | Password   |
|-------|----------------------|------------|
| Admin | admin@desicart.in    | admin123   |
| User  | user@desicart.in     | user1234   |

Or use the **"Demo User" / "Demo Admin"** buttons on the Login page.

---

## 💳 Test Payments (Razorpay Test Mode)

Use these test card details in the Razorpay popup:
- **Card Number:** `4111 1111 1111 1111`
- **Expiry:** Any future date (e.g., `12/26`)
- **CVV:** `123`
- **OTP:** `1234` (if prompted)

For UPI test: use `success@razorpay`

---

## 🌐 API Endpoints Reference

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login + get JWT |
| GET | `/api/auth/profile` | Private | Get my profile |
| PUT | `/api/auth/profile` | Private | Update my profile |
| GET | `/api/auth/users` | Admin | Get all users |
| DELETE | `/api/auth/users/:id` | Admin | Delete user |

### Products
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/products` | Public | List with filters, search, pagination |
| GET | `/api/products/:id` | Public | Single product + reviews |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| POST | `/api/products/:id/reviews` | Private | Add review |
| GET | `/api/products/categories/list` | Public | All categories |

### Cart
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/cart` | Private | Get my cart |
| POST | `/api/cart/add` | Private | Add item |
| PUT | `/api/cart/update` | Private | Update quantity |
| DELETE | `/api/cart/remove/:productId` | Private | Remove item |
| DELETE | `/api/cart/clear` | Private | Clear cart |

### Orders
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/orders` | Private | Place order |
| GET | `/api/orders/my` | Private | My orders |
| GET | `/api/orders/:id` | Private | Order detail |
| PUT | `/api/orders/:id/pay` | Private | Mark as paid |
| GET | `/api/orders` | Admin | All orders |
| PUT | `/api/orders/:id/status` | Admin | Update status |

### Payment
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/payment/create-order` | Private | Create Razorpay order |
| POST | `/api/payment/verify` | Private | Verify payment signature |

---

## 📦 All Dependencies

### Backend
```
express           - Web framework
mongoose          - MongoDB ODM
bcryptjs          - Password hashing
jsonwebtoken      - JWT authentication
cors              - Cross-origin requests
dotenv            - Environment variables
express-async-handler - Async error handling
multer            - File upload handling
cloudinary        - Image CDN
multer-storage-cloudinary - Multer + Cloudinary bridge
razorpay          - Payment gateway SDK
morgan            - HTTP logger (dev)
nodemon (dev)     - Auto-restart on file changes
```

### Frontend
```
react             - UI library
react-dom         - DOM rendering
react-router-dom  - Client-side routing
axios             - HTTP client
react-hot-toast   - Toast notifications
react-icons       - Icon library
vite              - Build tool + dev server
@vitejs/plugin-react - React plugin for Vite
```

---

## 🚀 Production Deployment

### Backend (Railway / Render / Heroku)
```bash
# Set all environment variables in the dashboard
# Set NODE_ENV=production
# Your start command: node server.js
```

### Frontend (Vercel / Netlify)
```bash
# Build command:
npm run build

# Output directory: dist

# Set environment variable:
VITE_API_URL=https://your-backend-url.com/api
```

### MongoDB Atlas (Free Cloud DB)
1. https://cloud.mongodb.com → Create free cluster (M0)
2. Network Access → Add IP `0.0.0.0/0`
3. Database Access → Create user
4. Clusters → Connect → Copy connection string

---

## 🔧 Common Issues & Fixes

| Problem | Solution |
|---------|----------|
| `MONGO_URI` connection error | Check Atlas IP whitelist; ensure URI is correct |
| Images not uploading | Verify Cloudinary credentials in `.env` |
| Razorpay popup blocked | Allow popups in browser; use HTTP not file:// |
| CORS errors | Ensure `CLIENT_URL` in backend `.env` matches frontend port |
| Port 5000 in use | Change `PORT=5001` in backend `.env` |
| `nodemon` not found | Run `npm install` in backend folder |

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--saffron` | `#E8520A` | Primary CTA, accents |
| `--forest` | `#1B6B3A` | Success states, eco labels |
| `--gold` | `#D4A017` | Featured badges |
| `--font-display` | Playfair Display | Headings, brand |
| `--font-body` | DM Sans | Body text, UI |

---

## 📝 Adding More Features (Ideas)

- [ ] Wishlist / Saved items
- [ ] Product variants (size, colour)
- [ ] Email notifications (Nodemailer)
- [ ] Coupon codes and discounts
- [ ] SMS OTP login (Twilio)
- [ ] Admin analytics dashboard (charts)
- [ ] Progressive Web App (PWA)
- [ ] Multi-language (Hindi support)

---

## 📄 License

MIT — Free to use for personal and commercial projects.

---

Built with ❤️ in India 🇮🇳 | DesiCart © 2025
