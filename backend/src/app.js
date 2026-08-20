const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../../docs/swagger.json');
const pool = require('./db/pool');
const authRoutes = require('./routes/authRoutes');
const promotionRoutes = require('./routes/promotionRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_ORIGIN }));
app.use(express.json());

app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode}`);
  });
  next();
});

app.get('/health', async (req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/applications', applicationRoutes.topRouter);

app.use(errorHandler);

module.exports = app;
