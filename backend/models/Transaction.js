const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be positive'],
    },
    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: ['income', 'expense'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Food',
        'Travel',
        'Bills',
        'Entertainment',
        'Shopping',
        'Healthcare',
        'Education',
        'Salary',
        'Freelance',
        'Investment',
        'Other',
      ],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
