const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// 🔴 THIS LINE IS REQUIRED
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    database: 'connected',
  });
});

// 🔴 ROUTES MUST COME AFTER express.json()
app.use('/api/auth', authRoutes);

module.exports = app;
