# Birdie — Prediction Markets

Full-stack prediction markets app with user auth, PostgreSQL, and AI-powered market generation.

**Live stack:** React → Vercel · Express → Railway · PostgreSQL → Railway · Google OAuth → Google Cloud

---

## Local Development

### Prerequisites
- Node.js (install via nvm)
- A PostgreSQL database (Railway is easiest — see deployment below)

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/birdie.git
cd birdie

cd backend && npm install
cd ../frontend && npm install
```

### 2. Set up environment variables

```bash
# In backend/
cp .env.example .env
# Fill in all values in .env

# In frontend/
cp .env.example .env
# Fill in REACT_APP_GOOGLE_CLIENT_ID and REACT_APP_API_URL
```

### 3. Set up the database

```bash
cd backend
npx prisma db push        # Creates tables from schema
node prisma/seed.js       # Seeds starter markets
```

### 4. Run

Open two terminals:

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm start
```

App runs at **http://localhost:3000**

---

## Deployment

### Step 1 — Push to GitHub

Create a new repo on GitHub and push your code:

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/birdie.git
git push -u origin main
```

---

### Step 2 — Deploy Backend on Railway

1. Go to **https://railway.app** and sign up with GitHub
2. Click **New Project → Deploy from GitHub repo** → select your repo
3. Set the **root directory** to `backend`
4. Click **Add Plugin → PostgreSQL** — Railway creates a database and auto-sets `DATABASE_URL`
5. Go to **Variables** and add:
   ```
   JWT_SECRET=your-long-random-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   FRONTEND_URL=https://your-app.vercel.app
   NODE_ENV=production
   ```
6. Railway auto-deploys. Once live, copy your Railway URL (looks like `https://birdie-production.up.railway.app`)
7. Run migrations by going to Railway → your service → **Settings → Deploy → Add command**:
   ```
   npx prisma db push && node prisma/seed.js
   ```
   Or connect to Railway shell and run manually.

---

### Step 3 — Set up Google OAuth

1. Go to **https://console.cloud.google.com**
2. Create a new project called "Birdie"
3. Go to **APIs & Services → Credentials → Create Credentials → OAuth Client ID**
4. Application type: **Web application**
5. Add authorized origins:
   ```
   http://localhost:3000
   https://your-app.vercel.app
   ```
6. Add authorized redirect URIs:
   ```
   http://localhost:3000
   https://your-app.vercel.app
   ```
7. Copy the **Client ID** — you'll need it for both backend and frontend env vars

---

### Step 4 — Deploy Frontend on Vercel

1. Go to **https://vercel.com** and sign up with GitHub
2. Click **New Project → Import** → select your repo
3. Set **Root Directory** to `frontend`
4. Add environment variables:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
   REACT_APP_API_URL=https://your-railway-url.up.railway.app
   ```
5. Click **Deploy**
6. Copy your Vercel URL and update `FRONTEND_URL` in Railway env vars

---

### Step 5 — Update CORS

Once you have your Vercel URL, make sure it's set in Railway's `FRONTEND_URL` variable. The backend CORS config already handles `*.vercel.app` URLs.

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (auto-set by Railway) |
| `JWT_SECRET` | Long random string for signing tokens |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `FRONTEND_URL` | Your Vercel URL |
| `PORT` | Server port (Railway sets this automatically) |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `REACT_APP_GOOGLE_CLIENT_ID` | Same Google Client ID as backend |
| `REACT_APP_API_URL` | Your Railway backend URL |

---

## Adding Markets Manually

Connect to your Railway PostgreSQL database using a GUI like **TablePlus** (free) or **DBeaver**:

1. Get your connection string from Railway → PostgreSQL plugin → Connect
2. Run SQL directly:
```sql
INSERT INTO "Market" (title, category, "yesProb", volume, resolved, outcome, "createdAt", "updatedAt")
VALUES ('Will X happen by Y date?', 'Sports', 60, 50000, false, null, NOW(), NOW());
```

Or add a simple admin endpoint — ask for that if you need it.

---

## Project Structure

```
birdie/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      ← database models
│   │   └── seed.js            ← starter markets
│   ├── src/
│   │   ├── lib/prisma.js      ← db client
│   │   ├── middleware/auth.js ← JWT verification
│   │   ├── routes/
│   │   │   ├── auth.js        ← register, login, google, /me
│   │   │   ├── markets.js     ← get, create, AI generate
│   │   │   ├── bets.js        ← place bet, fetch mine
│   │   │   └── funds.js       ← packages, balance, purchase
│   │   └── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── context/
    │   │   ├── AuthContext.jsx ← user, token, login/logout
    │   │   └── AppContext.jsx  ← markets, bets, API calls
    │   ├── pages/
    │   │   ├── Login.jsx/css
    │   │   ├── Register.jsx/css
    │   │   ├── Home.jsx/css
    │   │   └── Auth.css
    │   ├── components/
    │   │   ├── Header.jsx/css
    │   │   ├── CategoryTabs.jsx/css
    │   │   ├── MarketCard.jsx/css
    │   │   ├── FundsModal.jsx/css
    │   │   ├── PositionsList.jsx/css
    │   │   └── Toast.jsx/css
    │   ├── App.jsx
    │   ├── index.jsx
    │   └── index.css
    └── package.json
```
