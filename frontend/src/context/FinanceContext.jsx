import React, { createContext, useContext, useState, useCallback } from 'react';
import { transactionAPI } from '../services/api';

const FinanceContext = createContext(null);

export const FinanceProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0, categoryBreakdown: {} });
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await transactionAPI.getAll(params);
      setTransactions(res.data.transactions);
      setSummary(res.data.summary);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMonthlySummary = useCallback(async (year) => {
    try {
      const res = await transactionAPI.getMonthlySummary(year);
      setMonthlySummary(res.data);
    } catch (err) {
      console.error('Failed to load monthly summary:', err);
    }
  }, []);

  const addTransaction = useCallback(async (data) => {
    const res = await transactionAPI.create(data);
    setTransactions((prev) => [res.data, ...prev]);
    // Recalculate summary
    setSummary((prev) => {
      const newSummary = { ...prev };
      if (res.data.type === 'income') {
        newSummary.totalIncome += res.data.amount;
        newSummary.balance += res.data.amount;
      } else {
        newSummary.totalExpense += res.data.amount;
        newSummary.balance -= res.data.amount;
        newSummary.categoryBreakdown = {
          ...prev.categoryBreakdown,
          [res.data.category]: (prev.categoryBreakdown[res.data.category] || 0) + res.data.amount,
        };
      }
      return newSummary;
    });
    return res.data;
  }, []);

  const deleteTransaction = useCallback(async (id) => {
    const tx = transactions.find((t) => t._id === id);
    await transactionAPI.remove(id);
    setTransactions((prev) => prev.filter((t) => t._id !== id));
    if (tx) {
      setSummary((prev) => {
        const newSummary = { ...prev };
        if (tx.type === 'income') {
          newSummary.totalIncome -= tx.amount;
          newSummary.balance -= tx.amount;
        } else {
          newSummary.totalExpense -= tx.amount;
          newSummary.balance += tx.amount;
          const cb = { ...prev.categoryBreakdown };
          cb[tx.category] = Math.max(0, (cb[tx.category] || 0) - tx.amount);
          newSummary.categoryBreakdown = cb;
        }
        return newSummary;
      });
    }
  }, [transactions]);

  return (
    <FinanceContext.Provider value={{ transactions, summary, monthlySummary, loading, error, fetchTransactions, fetchMonthlySummary, addTransaction, deleteTransaction }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
};
