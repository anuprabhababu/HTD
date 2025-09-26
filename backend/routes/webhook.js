const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const crypto = require('crypto');

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET; // set in your .env

router.post('/payment', (req, res) => {
  const body = JSON.stringify(req.body);
  const expectedSignature = req.headers['x-razorpay-signature'];

  const generatedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  if (generatedSignature === expectedSignature) {
    const payment = req.body.payload.payment.entity;

    const tx = new Transaction({
      user: payment.email,
      amount: payment.amount / 100,
      to: payment.to || payment.notes?.to || '',
      status: payment.status,
      date: new Date(payment.created_at * 1000),
      category: 'Uncategorized',
      note: payment.notes?.note || ''
    });

    tx.save()
      .then(() => res.status(200).json({ success: true }))
      .catch(err => res.status(500).json({ error: 'DB error' }));
  } else {
    res.status(400).json({ error: 'Invalid signature' });
  }
});

module.exports = router;
