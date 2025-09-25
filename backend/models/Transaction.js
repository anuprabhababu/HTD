const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  to: { type: String },
  category: { type: String, default: 'Uncategorized' },
  note: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['done','pending','failed'], default: 'done' }
});

module.exports = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
