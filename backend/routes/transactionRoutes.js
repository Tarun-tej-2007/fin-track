const express = require('express');
const router = express.Router();
const {
  getTransactions,
  createTransaction,
  deleteTransaction,
  getMonthlySummary,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getTransactions);
router.get('/monthly-summary', getMonthlySummary);
router.post('/', createTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
