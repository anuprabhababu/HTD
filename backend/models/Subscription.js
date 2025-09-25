const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  endpoint: { type: String, required: true, unique: true },
  keys: {
    p256dh: { type: String },
    auth: { type: String }
  },
  createdAt: { type: Date, default: Date.now }
});

const Subscription = mongoose.modelNames().includes('Subscription') 
  ? mongoose.model('Subscription') 
  : mongoose.model('Subscription', SubscriptionSchema);

module.exports = Subscription;
