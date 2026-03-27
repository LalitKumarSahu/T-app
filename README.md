# 🚜 Tractor Work Manager

A complete web application to manage tractor work records — track farmers, hours, payments, and outstanding balances.

---

## 📁 Project Structure

```
tractor-app/
├── server.js          ← Node.js + Express backend + REST API
├── package.json       ← Dependencies
├── .env.example       ← Environment variable template
└── public/            ← Frontend (served statically by Express)
    ├── index.html
    ├── style.css
    └── script.js
```

---

## ⚙️ Setup Instructions (Step by Step)

### Step 1 — Install Node.js
Download from https://nodejs.org (choose the LTS version).
Verify: `node -v` and `npm -v`

### Step 2 — Install MongoDB

**Option A — Local MongoDB**
1. Download from https://www.mongodb.com/try/download/community
2. Install and start the service:
   - Windows: It starts automatically as a service
   - Mac: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

**Option B — MongoDB Atlas (Cloud, Free)**
1. Go to https://cloud.mongodb.com
2. Create a free account → New Project → Free Cluster
3. Under "Database Access" → Add a database user
4. Under "Network Access" → Allow your IP (or 0.0.0.0/0 for all)
5. Click "Connect" → "Drivers" → copy the connection string
6. Replace `<password>` with your password in the string

### Step 3 — Set Up the Project

```bash
# 1. Go into the project folder
cd tractor-app

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.example .env

# 4. Edit .env and set your MongoDB URI (if using Atlas)
```

### Step 4 — Run the Application

```bash
# Production mode
npm start

# Development mode (auto-restarts on file changes)
npm run dev
```

Open your browser: **http://localhost:3000**

---

## 🔌 REST API Reference

| Method | Endpoint         | Description             |
|--------|------------------|-------------------------|
| GET    | `/all`           | Get all farmer records  |
| POST   | `/add`           | Add a new farmer record |
| PUT    | `/pay/:id`       | Add a payment           |
| DELETE | `/delete/:id`    | Delete a record         |

### POST /add — Request Body
```json
{
  "name": "Ramesh Kumar",
  "hoursWorked": 8,
  "ratePerHour": 500,
  "paidAmount": 1000
}
```

### PUT /pay/:id — Request Body
```json
{
  "amount": 500
}
```

---

## 🧮 Auto-calculations

- **Total Amount** = Hours Worked × Rate per Hour
- **Remaining Balance** = Total Amount − Paid Amount

These are computed automatically on every save.

---

## 📱 Features

- ✅ Add farmer records with name, hours, rate, advance payment
- ✅ Auto-calculate total & balance
- ✅ Live preview while filling the form
- ✅ Summary stats (total records, billed, collected, outstanding)
- ✅ Add payment modal
- ✅ Delete record with confirmation
- ✅ Status badges (Settled / Due / Overpaid)
- ✅ Toast notifications for every action
- ✅ Mobile-responsive design
- ✅ Data persisted in MongoDB

---

## 🛠 Troubleshooting

| Problem | Fix |
|---------|-----|
| `MongoDB connection error` | Make sure MongoDB is running or check your Atlas URI |
| `Cannot GET /` | Make sure you're in the `tractor-app` folder and ran `npm install` |
| Port 3000 already in use | Change `PORT=3001` in `.env` |
| `npm: command not found` | Install Node.js from nodejs.org |