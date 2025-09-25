// backend/server.js

require('dotenv').config();            // Load .env variables
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // Your MongoDB connection module
const webpush = require('web-push');

const app = express();

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Configure Web Push
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:you@yourdomain.com';

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
} else {
  console.warn('⚠️ VAPID keys not set, push notifications will not work.');
}

// Routes
app.use('/api/auth', require('./routes/auth'));                 // Auth routes
app.use('/api/transactions', require('./routes/transactions')); // Transactions routes
app.use('/api/notifications', require('./routes/notifications')); // Push notifications

// Test route
app.get('/', (req, res) => res.send('Expense backend running'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
