const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth'); // JWT middleware

// Protect all routes
router.use(auth);

// Create transaction
router.post('/', async (req, res) => {
  try {
    const { amount, to, status, category, note, date } = req.body;
    if (amount == null) return res.status(400).json({ error: 'amount required' });

    const tx = new Transaction({
      user: req.user.id,       // link to logged-in user
      amount,
      to,
      status: status || 'done',
      category: category || 'Uncategorized',
      note: note || '',
      date
    });

    await tx.save();
    res.status(201).json(tx);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all transactions (timeline) for logged-in user
router.get('/', async (req, res) => {
  try {
    const txs = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    res.json(txs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update note/category (only if it belongs to logged-in user)
router.put('/:id', async (req, res) => {
  try {
    const { note, category } = req.body;
    const update = {};
    if (note !== undefined) update.note = note;
    if (category !== undefined) update.category = category;

    const tx = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id }, // ensure ownership
      { $set: update },
      { new: true }
    );

    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    res.json(tx);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Analytics: category (only logged-in user's transactions)
router.get('/analytics/category', async (req, res) => {
  try {
    const agg = await Transaction.aggregate([
      { $match: { user: req.user.id } }, // filter by user
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }
    ]);
    res.json(agg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Analytics: monthly totals (only logged-in user's transactions)
router.get('/analytics/monthly', async (req, res) => {
  try {
    const agg = await Transaction.aggregate([
      { $match: { user: req.user.id } },
      { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, total: { $sum: '$amount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    res.json(agg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
