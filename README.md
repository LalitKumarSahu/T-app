# 🚜 Tractor Work Manager

A complete web application to manage tractor work records — track farmers, working hours, payments, and outstanding balances.

---

## 🌍 Live Demo

👉 https://t-app-7ykc.onrender.com/

---

## 📁 Project Structure

```
tractor-app/
├── server.js          ← Node.js + Express backend + REST API
├── package.json       ← Dependencies
├── .env.example       ← Environment variable template
├── .gitignore         ← Ignore secrets like .env
└── public/            ← Frontend (served by Express)
    ├── index.html
    ├── style.css
    └── script.js
```

---

## ⚙️ Setup Instructions (Step by Step)

### Step 1 — Install Node.js

Download from: https://nodejs.org (LTS version recommended)

Verify installation:

```bash
node -v
npm -v
```

---

### Step 2 — MongoDB Setup

#### Option A — MongoDB Atlas (Recommended, Free Cloud)

1. Go to https://cloud.mongodb.com
2. Create account → Create Project → Create Free Cluster
3. Go to **Database Access** → Create user (username + password)
4. Go to **Network Access** → Allow access (0.0.0.0/0)
5. Click **Connect → Drivers**
6. Copy connection string and replace `<password>`

---

### Step 3 — Setup Project

```bash
# Clone repo
git clone https://github.com/YOUR_USERNAME/tractor-app.git

# Enter folder
cd tractor-app

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

---

### Step 4 — Configure Environment Variables

Edit `.env` file:

```
PORT=3000
MONGO_URI=your_mongodb_connection_string
```

---

### Step 5 — Run Application

```bash
# Production
npm start

# Development
npm run dev
```

Open in browser:
👉 http://localhost:3000

---

## 🔌 REST API Endpoints

| Method | Endpoint    | Description            |
| ------ | ----------- | ---------------------- |
| GET    | /all        | Get all farmer records |
| POST   | /add        | Add new record         |
| PUT    | /pay/:id    | Add payment            |
| DELETE | /delete/:id | Delete record          |

---

## 🧮 Auto Calculations

* **Total Amount** = Hours Worked × Rate Per Hour
* **Remaining Balance** = Total − Paid Amount

Automatically calculated before saving.

---

## 📱 Features

* ✅ Add farmer records
* ✅ Track hours & rate
* ✅ Auto calculation (total & remaining)
* ✅ Payment update system
* ✅ Delete completed records
* ✅ Live preview while typing
* ✅ Summary dashboard (stats)
* ✅ Search & filter support
* ✅ Mobile responsive UI
* ✅ Toast notifications
* ✅ MongoDB persistent storage

---

## ☁️ Deployment (Render)

This app is deployed on:
👉 https://t-app-7ykc.onrender.com/

### Steps to Deploy:

1. Push code to GitHub
2. Go to Render → New Web Service
3. Connect GitHub repo
4. Set:

   * Build Command: `npm install`
   * Start Command: `node server.js`
5. Add Environment Variables:

   * `MONGO_URI`
   * `PORT=10000`
6. Click Deploy

---

## 🔐 Security Notes

* `.env` file is NOT pushed to GitHub
* Secrets stored safely in Render Environment Variables
* `.gitignore` includes:

```
node_modules
.env
```

---

## 🛠 Troubleshooting

| Problem         | Solution                     |
| --------------- | ---------------------------- |
| MongoDB error   | Check URI and network access |
| App not loading | Ensure server is running     |
| Port issue      | Change PORT in .env          |
| Slow loading    | Free hosting sleep mode      |

---

## 📱 Future Improvements

* 🔐 Login system
* 📄 PDF bill generation
* 📊 Reports & analytics
* 📲 Android app (APK)
* ☁️ Backup & export

---

## 👨‍💻 Author

Made with ❤️ for real-world tractor work management 🚜
