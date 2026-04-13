# FinTrack — Class Schedule & Personal Finance Manager

A full-stack JavaScript web application built with React + Vite (frontend) and Node.js + Express + MongoDB (backend).

---

## 📁 Project Structure

```
fintrack/
├── backend/
│   ├── config/         # MongoDB connection
│   ├── controllers/    # Route handlers (auth, classes, transactions)
│   ├── middleware/     # JWT auth middleware
│   ├── models/         # Mongoose schemas (User, Class, Transaction)
│   ├── routes/         # Express routers
│   ├── server.js       # Entry point
│   └── .env.example    # Environment variable template
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/   # AppLayout, Sidebar
    │   │   └── ui/       # Reusable UI components
    │   ├── context/      # AuthContext, ScheduleContext, FinanceContext
    │   ├── pages/        # Login, Register, Dashboard, Schedule, Finance
    │   ├── services/     # Axios API service layer
    │   ├── App.jsx       # Routing
    │   └── main.jsx      # Entry point
    ├── index.html
    └── .env.example      # Environment variable template
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local install or MongoDB Atlas free tier)
- npm

---

### 1. Clone / Extract the project

```bash
cd fintrack
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/fintrack
JWT_SECRET=replace_this_with_a_long_random_secret_string
NODE_ENV=development
```

> **MongoDB Atlas (cloud):** Replace `MONGO_URI` with your Atlas connection string, e.g.:
> `mongodb+srv://user:password@cluster.mongodb.net/fintrack?retryWrites=true&w=majority`

Start the backend:

```bash
npm run dev       # with nodemon (hot reload)
# or
npm start         # production
```

The API will be running at `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

`frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

The app will be running at `http://localhost:5173`

---

## 🌐 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user (protected) |

### Classes (all protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/classes` | Get all classes |
| POST | `/api/classes` | Create class |
| PUT | `/api/classes/:id` | Update class |
| DELETE | `/api/classes/:id` | Delete class |

### Transactions (all protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | Get transactions (supports ?month=&year=&type=&category=) |
| GET | `/api/transactions/monthly-summary` | Get 12-month summary for charts |
| POST | `/api/transactions` | Create transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |

---

## ✨ Features

### Authentication
- JWT-based login/register
- bcrypt password hashing (12 salt rounds)
- Protected routes (frontend + backend)
- Auto-logout on token expiry

### Class Scheduler
- Add, edit, delete classes
- Weekly timetable grid view + list view
- Conflict detection (prevents time overlaps on same day)
- Color-coded classes

### Personal Finance
- Income and expense tracking
- Category-wise breakdown with icons
- Monthly budget tracker (persisted in localStorage)
- Filters by month/year, type, and category
- Monthly income vs expense bar chart
- Expense distribution pie chart

### Dashboard
- Greeting with today's date
- Summary stat cards (income, expenses, balance, classes)
- Income vs Expenses bar chart (12-month view)
- Expense breakdown pie chart
- Today's classes widget
- Recent transactions widget

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 18 + Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Routing | React Router v6 |
| State management | React Context API |
| HTTP client | Axios |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |

---

## 📝 Notes

- All files are `.js` / `.jsx` — no TypeScript anywhere
- The frontend uses a custom dark design system with Tailwind utility classes
- Budget is stored in `localStorage` per device (no server persistence needed)
- Transaction filters (month/year) are sent as query params to the API
