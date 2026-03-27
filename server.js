// ============================================================
//  server.js  –  Tractor Work Management API
//  Stack : Node.js · Express · MongoDB (Mongoose)
// ============================================================

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));   // serve frontend

// ── MongoDB Connection ──────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tractorDB';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅  MongoDB connected successfully'))
  .catch((err) => {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  });

// ── Mongoose Schema & Model ─────────────────────────────────
const farmerSchema = new mongoose.Schema(
  {
    name:          { type: String, required: [true, 'Farmer name is required'], trim: true },
    hoursWorked:   { type: Number, required: [true, 'Hours worked is required'], min: 0 },
    ratePerHour:   { type: Number, required: [true, 'Rate per hour is required'], min: 0 },
    paidAmount:    { type: Number, default: 0, min: 0 },
    // Computed fields – stored for convenience & sorting
    totalAmount:   { type: Number },
    remaining:     { type: Number },
  },
  { timestamps: true }
);

// Auto-compute before every save
farmerSchema.pre('save', function (next) {
  this.totalAmount = this.hoursWorked * this.ratePerHour;
  this.remaining   = this.totalAmount - this.paidAmount;
  next();
});

const Farmer = mongoose.model('Farmer', farmerSchema);

// ── Helper ──────────────────────────────────────────────────
const recalc = (doc) => {
  doc.totalAmount = doc.hoursWorked * doc.ratePerHour;
  doc.remaining   = doc.totalAmount - doc.paidAmount;
};

// ── Routes ──────────────────────────────────────────────────

// POST /add  –  Add a new farmer record
app.post('/add', async (req, res) => {
  try {
    const { name, hoursWorked, ratePerHour, paidAmount } = req.body;

    if (!name || hoursWorked == null || ratePerHour == null) {
      return res.status(400).json({ success: false, message: 'Name, hours worked and rate are required.' });
    }

    const farmer = new Farmer({ name, hoursWorked, ratePerHour, paidAmount: paidAmount || 0 });
    await farmer.save();

    res.status(201).json({ success: true, message: 'Farmer record added!', data: farmer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /all  –  Get all farmer records (newest first)
app.get('/all', async (req, res) => {
  try {
    const farmers = await Farmer.find().sort({ createdAt: -1 });
    res.json({ success: true, data: farmers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /pay/:id  –  Add a payment for a farmer
app.put('/pay/:id', async (req, res) => {
  try {
    const { amount } = req.body;

    if (amount == null || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be greater than 0.' });
    }

    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) return res.status(404).json({ success: false, message: 'Record not found.' });

    farmer.paidAmount += Number(amount);
    recalc(farmer);
    await farmer.save();

    res.json({ success: true, message: 'Payment updated!', data: farmer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /delete/:id  –  Delete a farmer record
app.delete('/delete/:id', async (req, res) => {
  try {
    const farmer = await Farmer.findByIdAndDelete(req.params.id);
    if (!farmer) return res.status(404).json({ success: false, message: 'Record not found.' });

    res.json({ success: true, message: 'Record deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Catch-all  –  serve index.html for any unknown route (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start Server ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚜  Tractor App running at http://localhost:${PORT}`);
});