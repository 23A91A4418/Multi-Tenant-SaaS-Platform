const express = require('express');
const cors = require('cors');
require('dotenv').config();

// ROUTES
const authRoutes = require('./routes/authRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const app = express();

/* =======================
   MIDDLEWARE (ORDER MATTERS)
   ======================= */
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// THIS MUST COME BEFORE ROUTES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

/* =======================
   ROUTES
   ======================= */
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', taskRoutes);

// HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'connected' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
