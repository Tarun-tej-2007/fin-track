import React, { useEffect, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  TrendingUp, TrendingDown, DollarSign, Plus, Trash2,
  Filter, Wallet, Tag,
} from 'lucide-react';
import { Modal, Button, EmptyState, StatCard } from '../components/ui/index.jsx';

const CATEGORIES = {
  expense: ['Food', 'Travel', 'Bills', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Other'],
  income: ['Salary', 'Freelance', 'Investment', 'Other'],
};

const CATEGORY_ICONS = {
  Food: '🍔', Travel: '✈️', Bills: '🧾', Entertainment: '🎬',
  Shopping: '🛍️', Healthcare: '💊', Education: '📚', Salary: '💼',
  Freelance: '💻', Investment: '📈', Other: '📦',
};

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);

const defaultForm = { amount: '', type: 'expense', category: 'Food', date: new Date().toISOString().split('T')[0], description: '' };

const now = new Date();

export default function FinancePage() {
  const { transactions, summary, loading, error, fetchTransactions, addTransaction, deleteTransaction } = useFinance();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [filter, setFilter] = useState({ type: '', category: '', month: now.getMonth() + 1, year: now.getFullYear() });
  const [budget, setBudget] = useState(() => parseFloat(localStorage.getItem('ft_budget') || '0'));
  const [budgetInput, setBudgetInput] = useState('');
  const [budgetEdit, setBudgetEdit] = useState(false);

  useEffect(() => {
    fetchTransactions({ month: filter.month, year: filter.year, type: filter.type || undefined, category: filter.category || undefined });
  }, [filter]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => {
      const next = { ...p, [name]: value };
      // Reset category when type changes
      if (name === 'type') next.category = value === 'income' ? 'Salary' : 'Food';
      return next;
    });
    if (formError) setFormError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) { setFormError('Please enter a valid positive amount'); return; }
    setSaving(true);
    try {
      await addTransaction({ ...form, amount: parseFloat(form.amount) });
      setModalOpen(false);
      setForm(defaultForm);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add transaction');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await deleteTransaction(deleteId); setDeleteId(null); }
    catch { /* noop */ }
    finally { setDeleting(false); }
  };

  const saveBudget = () => {
    const v = parseFloat(budgetInput);
    if (!isNaN(v) && v > 0) {
      setBudget(v);
      localStorage.setItem('ft_budget', v);
    }
    setBudgetEdit(false);
    setBudgetInput('');
  };

  const budgetUsed = summary.totalExpense;
  const budgetPct = budget > 0 ? Math.min((budgetUsed / budget) * 100, 100) : 0;
  const budgetColor = budgetPct < 60 ? '#10b981' : budgetPct < 85 ? '#f59e0b' : '#ef4444';

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f0ff]">Finance</h1>
          <p className="text-sm text-[#6b6880] mt-0.5">{transactions.length} transaction{transactions.length !== 1 ? 's' : ''} this period</p>
        </div>
        <Button onClick={() => { setForm(defaultForm); setFormError(''); setModalOpen(true); }}>
          <Plus size={16} /> Add Transaction
        </Button>
      </div>

      {error && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm px-4 py-3 rounded-xl">{error}</div>}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Income" value={formatCurrency(summary.totalIncome)} icon={TrendingUp} color="emerald" />
        <StatCard label="Total Expenses" value={formatCurrency(summary.totalExpense)} icon={TrendingDown} color="rose" />
        <StatCard label="Net Balance" value={formatCurrency(summary.balance)} icon={DollarSign} color={summary.balance >= 0 ? 'violet' : 'rose'} />
      </div>

      {/* Budget tracker */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#f1f0ff] flex items-center gap-2"><Wallet size={16} className="text-violet-400" /> Monthly Budget</h2>
          <button onClick={() => setBudgetEdit((p) => !p)} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">{budget > 0 ? 'Edit' : 'Set Budget'}</button>
        </div>
        {budgetEdit ? (
          <div className="flex gap-2">
            <input type="number" value={budgetInput} onChange={(e) => setBudgetInput(e.target.value)} placeholder="Enter budget amount" className="input flex-1" min="1" />
            <Button onClick={saveBudget} size="sm">Save</Button>
          </div>
        ) : budget > 0 ? (
          <>
            <div className="flex items-center justify-between text-xs text-[#a09db5] mb-2">
              <span>{formatCurrency(budgetUsed)} spent</span>
              <span>{formatCurrency(budget - budgetUsed)} remaining</span>
            </div>
            <div className="h-2 bg-[#1e1e2a] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${budgetPct}%`, backgroundColor: budgetColor }} />
            </div>
            <p className="text-xs text-[#6b6880] mt-1.5">{budgetPct.toFixed(0)}% of {formatCurrency(budget)} budget used</p>
          </>
        ) : (
          <p className="text-sm text-[#6b6880]">Set a monthly budget to track your spending.</p>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter size={14} className="text-[#6b6880]" />
        <select value={`${filter.year}-${String(filter.month).padStart(2,'0')}`} onChange={(e) => { const [y, m] = e.target.value.split('-'); setFilter((p) => ({ ...p, year: +y, month: +m })); }} className="input w-auto py-1.5 text-xs">
          {Array.from({ length: 24 }, (_, i) => { const d = new Date(); d.setMonth(d.getMonth() - i); return { label: `${months[d.getMonth()]} ${d.getFullYear()}`, value: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` }; }).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={filter.type} onChange={(e) => setFilter((p) => ({ ...p, type: e.target.value }))} className="input w-auto py-1.5 text-xs">
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select value={filter.category} onChange={(e) => setFilter((p) => ({ ...p, category: e.target.value }))} className="input w-auto py-1.5 text-xs">
          <option value="">All Categories</option>
          {[...CATEGORIES.income, ...CATEGORIES.expense].filter((v, i, a) => a.indexOf(v) === i).map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Category breakdown */}
      {Object.keys(summary.categoryBreakdown).length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-[#f1f0ff] mb-3 flex items-center gap-2"><Tag size={16} className="text-violet-400" /> Expense by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {Object.entries(summary.categoryBreakdown).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
              <div key={cat} className="bg-[#1a1a24] rounded-xl p-3 border border-[#2a2a38]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{CATEGORY_ICONS[cat] || '📦'}</span>
                  <span className="text-xs text-[#a09db5] truncate">{cat}</span>
                </div>
                <p className="text-sm font-semibold text-[#f1f0ff]">{formatCurrency(amt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions list */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#2a2a38]">
          <h2 className="text-sm font-semibold text-[#f1f0ff]">Transactions</h2>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">{[1,2,3,4].map((i) => <div key={i} className="h-14 skeleton rounded-xl" />)}</div>
        ) : transactions.length === 0 ? (
          <EmptyState icon={Wallet} title="No transactions" description="Add your first transaction to start tracking your finances." action={<Button onClick={() => setModalOpen(true)}><Plus size={16} /> Add Transaction</Button>} />
        ) : (
          <div className="divide-y divide-[#2a2a38]">
            {transactions.map((tx) => (
              <div key={tx._id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#1a1a24] transition-colors group">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base ${tx.type === 'income' ? 'bg-emerald-400/10' : 'bg-rose-400/10'}`}>
                  {CATEGORY_ICONS[tx.category] || (tx.type === 'income' ? '💰' : '💸')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#f1f0ff] truncate">{tx.description || tx.category}</p>
                  <p className="text-xs text-[#6b6880]">{tx.category} · {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className={`text-sm font-semibold ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                  <span className={tx.type === 'income' ? 'badge-income' : 'badge-expense'}>{tx.type}</span>
                  <button onClick={() => setDeleteId(tx._id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-[#6b6880] hover:text-rose-400 hover:bg-rose-400/10 transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Transaction">
        <form onSubmit={handleSave} className="space-y-4">
          {formError && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm px-4 py-3 rounded-xl">{formError}</div>}
          <div>
            <label className="label">Type</label>
            <div className="flex gap-2">
              {['expense', 'income'].map((t) => (
                <button key={t} type="button" onClick={() => handleFormChange({ target: { name: 'type', value: t } })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${form.type === t
                    ? t === 'income' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                    : 'bg-[#1a1a24] border-[#2a2a38] text-[#6b6880] hover:text-[#f1f0ff]'}`}>
                  {t === 'income' ? '↑ Income' : '↓ Expense'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Amount</label>
            <input type="number" name="amount" value={form.amount} onChange={handleFormChange} placeholder="0.00" className="input" min="0.01" step="0.01" />
          </div>
          <div>
            <label className="label">Category</label>
            <select name="category" value={form.category} onChange={handleFormChange} className="input">
              {(CATEGORIES[form.type] || []).map((c) => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" name="date" value={form.date} onChange={handleFormChange} className="input" />
          </div>
          <div>
            <label className="label">Description <span className="text-[#6b6880] font-normal">(optional)</span></label>
            <input type="text" name="description" value={form.description} onChange={handleFormChange} placeholder="e.g. Grocery run" className="input" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={saving} className="flex-1">Add Transaction</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Transaction">
        <p className="text-sm text-[#a09db5] mb-5">Are you sure you want to delete this transaction?</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)} className="flex-1">Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete} className="flex-1">Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
