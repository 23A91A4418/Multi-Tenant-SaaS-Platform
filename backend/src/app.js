const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

/**
 * CORS CONFIGURATION (MANDATORY)
 * In Docker: FRONTEND_URL=http://frontend:3000
 * Local dev: FRONTEND_URL=http://localhost:3000
 */
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

/**
 * Health Check (MANDATORY)
 * Must return OK only after DB is ready
 */
const { checkDatabaseConnection } = require('./config/db');

app.get('/api/health', async (req, res) => {
  try {
    await checkDatabaseConnection();
    return res.status(200).json({
      status: 'ok',
      database: 'connected',
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      database: 'disconnected',
    });
  }
});

/**
 * Routes
 */
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/tenants', require('./routes/tenant.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/projects', require('./routes/project.routes'));
app.use('/api/tasks', require('./routes/task.routes'));


/**
 * Global Error Handler (MANDATORY)
 */
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

module.exports = app;
