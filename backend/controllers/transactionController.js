const Transaction = require('../models/Transaction');

// @desc    Get all transactions for user
// @route   GET /api/transactions
const getTransactions = async (req, res) => {
  try {
    const { month, year, type, category } = req.query;
    const filter = { userId: req.user._id };

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    } else if (year) {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }

    if (type) filter.type = type;
    if (category) filter.category = category;

    const transactions = await Transaction.find(filter).sort({ date: -1 });

    // Calculate summary
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Category breakdown
    const categoryBreakdown = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
      });

    res.json({
      transactions,
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        categoryBreakdown,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
};

// @desc    Create a transaction
// @route   POST /api/transactions
const createTransaction = async (req, res) => {
  try {
    const { amount, type, category, date, description } = req.body;

    if (!amount || !type || !category) {
      return res.status(400).json({ message: 'Please provide amount, type, and category' });
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      amount: Number(amount),
      type,
      category,
      date: date ? new Date(date) : new Date(),
      description,
    });

    res.status(201).json(transaction);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Failed to create transaction' });
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete transaction' });
  }
};

// @desc    Get monthly summary for charts
// @route   GET /api/transactions/monthly-summary
const getMonthlySummary = async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = parseInt(year) || new Date().getFullYear();

    const start = new Date(targetYear, 0, 1);
    const end = new Date(targetYear, 11, 31, 23, 59, 59);

    const transactions = await Transaction.find({
      userId: req.user._id,
      date: { $gte: start, $lte: end },
    });

    const monthly = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expense: 0,
    }));

    transactions.forEach((t) => {
      const m = new Date(t.date).getMonth();
      if (t.type === 'income') monthly[m].income += t.amount;
      else monthly[m].expense += t.amount;
    });

    res.json(monthly);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch monthly summary' });
  }
};

module.exports = { getTransactions, createTransaction, deleteTransaction, getMonthlySummary };
