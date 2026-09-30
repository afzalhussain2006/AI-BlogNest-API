require('dotenv').config();

const commentRoutes = require('./routes/commentRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const postRoutes = require('./routes/postRoutes');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const aiRoutes = require('./routes/aiRoutes');

const { connectDatabase } = require('./config/database');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.disable('x-powered-by');
app.use(helmet());

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/ai', aiRoutes);


app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/comments', commentRoutes);

app.get('/api/health', (_req, res) => {
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'unavailable',
    database: connected ? 'connected' : 'disconnected'
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: 'API endpoint not found.'
  });
});

app.get('/api/health', (_req, res) => {
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'unavailable',
    database: connected ? 'connected' : 'disconnected'
  });
});

async function start() {
  try {
    await connectDatabase(process.env.MONGODB_URI);

    const port = Number(process.env.PORT) || 3000;

    app.listen(port, () => {
      console.log(`BlogNest API listening on port ${port}.`);
    });
  } catch (error) {
    console.error(`Startup failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

module.exports = {
  app,
  start
};