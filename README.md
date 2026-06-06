# 🏛 Gov Portal — MERN Stack

A full-stack Government Welfare Scheme Portal built with **MongoDB, Express, React, Node.js**.

## 📁 Project Structure

```
govportal-mern/
├── server.js          ← Express + MongoDB backend (all API routes)
├── .env               ← Environment variables
├── package.json       ← Backend dependencies
└── client/            ← React frontend
    ├── public/
    └── src/
        ├── App.js             ← Routes & protected guards
        ├── context/
        │   ├── AuthContext.js ← Global auth state
        │   └── ToastContext.js← Global toast notifications
        ├── components/
        │   ├── UserNavbar.js
        │   ├── AdminSidebar.js
        │   └── Stepper.js
        ├── pages/
        │   ├── user/
        │   │   ├── UserLogin.js
        │   │   ├── UserRegister.js
        │   │   ├── UserDashboard.js
        │   │   ├── Schemes.js
        │   │   ├── SchemeDetail.js     ← Apply form embedded
        │   │   ├── MyApplications.js   ← BUG FIX HERE
        │   │   ├── EligibilityCheck.js
        │   │   └── Feedback.js
        │   └── admin/
        │       ├── AdminLogin.js
        │       ├── AdminDashboard.js
        │       ├── AdminApplications.js
        │       ├── AdminSchemes.js
        │       ├── AdminAddScheme.js
        │       ├── AdminUsers.js
        │       └── AdminFeedback.js
        └── utils/
            ├── api.js
            └── confetti.js
```

## 🚀 Setup

### 1. Install dependencies

```bash
# Backend
npm install

# Frontend
cd client && npm install
```

### 2. Configure environment

Edit `.env`:
```
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/govschemes
JWT_SECRET=your_secret_key
```

### 3. Seed the database

Start the backend, then visit: `http://localhost:3000/api/seed`

Admin credentials: `admin@gov.in` / `Admin123`

### 4. Development

```bash
# Terminal 1 — backend
npm run dev

# Terminal 2 — frontend (with hot reload)
cd client && npm start
# React dev server runs on :3001, proxies /api to :3000
```

### 5. Production build

```bash
npm run build     # builds React into client/build/
npm start         # serves everything from port 3000
```

## 🐛 Bug Fixed

**Problem:** When a user has multiple approved applications, applying for a second scheme and getting it approved caused the first scheme's `officialLink` to disappear.

**Root Cause:** In the original HTML/JS version, a shared variable was used to track the `officialLink`. When a new application was loaded/approved, it overwrote the single stored link.

**Fix:** The `/api/my-applications` endpoint now attaches each application's `officialLink` **independently** to its own application object using `Promise.all` with a separate DB query per approved app. In the React `MyApplications.js`, each `<AppCard>` renders its own `a.officialLink` directly from its own data — there is no shared state between cards. Multiple approved applications each display their own portal link permanently.

## 🎨 Features

- **User Portal:** Register, Login, Browse Schemes, Check Eligibility, Apply, Track Applications, Feedback
- **Admin Portal:** Dashboard stats, Manage Schemes, Review Applications (Approve/Reject), User list, Feedback replies
- **UX:** Dark theme, Ashoka tricolour stripe, confetti on portal click, progress stepper, toast notifications, skeleton loading, filter tabs, search
- **Security:** JWT auth, officialLink hidden until admin approves, role-based access
