require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const webpush = require('web-push');
const path = require('path');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: '*',       // allow all origins for testing
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true
}));
app.use(express.json());

// Configure Web Push
const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    VAPID_SUBJECT || 'mailto:you@yourdomain.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
} else {
  console.warn('⚠️ VAPID keys not set, push notifications will not work.');
}

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/webhook', require('./routes/webhook'));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
