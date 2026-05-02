const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');

dotenv.config();

// ==============================
// DB CONNECTION
// ==============================
connectDB();

const app = express();

// ==============================
// MIDDLEWARE
// ==============================
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // ✅ FIXED
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==============================
// API ROUTES
// ==============================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admission', require('./routes/admission'));
app.use('/api/seats', require('./routes/seats'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/dashboard', require('./routes/dashboard'));

// ==============================
// ROOT TEST
// ==============================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "Bijoy '24 Hall API running"
  });
});

// ==============================
// 404 HANDLER
// ==============================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ==============================
// ERROR HANDLER
// ==============================
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: 'Server Error'
  });
});

// ==============================
// START SERVER
// ==============================
const PORT = process.env.PORT || 5500;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});