const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const Subscription = require('../models/Subscription');
const Transaction = require('../models/Transaction');

// Save subscription
router.post('/subscribe', async (req, res) => {
  try {
    const sub = req.body;
    if (!sub || !sub.endpoint) return res.status(400).json({ error: 'Invalid subscription' });
    await Subscription.updateOne({ endpoint: sub.endpoint }, { $set: { endpoint: sub.endpoint, keys: sub.keys } }, { upsert: true });
    res.status(201).json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// Notify
router.post('/notify', async (req, res) => {
  try {
    const { transactionId } = req.body;
    if (!transactionId) return res.status(400).json({ error: 'transactionId required' });
    const tx = await Transaction.findById(transactionId);
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });

    const payload = JSON.stringify({ title: 'You have made a payment', body: 'Tap to view.', data: { transactionId: tx._id.toString() } });
    const subscriptions = await Subscription.find({});
    const results = [];

    for (const s of subscriptions) {
      const pushSub = { endpoint: s.endpoint, keys: s.keys };
      try { await webpush.sendNotification(pushSub, payload); results.push({ endpoint: s.endpoint, status: 'sent' }); }
      catch (err) { console.error('Push failed', err.message); if(err.statusCode===410||err.statusCode===404) await Subscription.deleteOne({ endpoint: s.endpoint }); results.push({ endpoint: s.endpoint, status: 'failed' }); }
    }

    res.json({ success: true, sent: results.length, results });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
