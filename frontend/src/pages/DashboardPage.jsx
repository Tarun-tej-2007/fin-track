import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSchedule } from '../context/ScheduleContext';
import { useFinance } from '../context/FinanceContext';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import {
  CalendarDays, Wallet, TrendingUp, TrendingDown, Clock,
  ArrowRight, BookOpen, DollarSign,
} from 'lucide-react';
import { StatCard } from '../components/ui/index.jsx';

const COLORS = ['#7c3aed', '#a855f7', '#34d399', '#fb7185', '#fbbf24', '#60a5fa', '#f97316', '#ec4899'];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a24] border border-[#2a2a38] rounded-xl px-3 py-2 text-xs shadow-xl">
      {label && <p className="text-[#a09db5] mb-1">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { classes, fetchClasses, getTodayClasses, loading: schedLoading } = useSchedule();
  const { transactions, summary, monthlySummary, fetchTransactions, fetchMonthlySummary, loading: finLoading } = useFinance();

  useEffect(() => {
    fetchClasses();
    const now = new Date();
    fetchTransactions({ month: now.getMonth() + 1, year: now.getFullYear() });
    fetchMonthlySummary(now.getFullYear());
  }, []);

  const todayClasses = getTodayClasses();
  const recentTransactions = transactions.slice(0, 5);

  // Category pie data
  const pieData = Object.entries(summary.categoryBreakdown)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Bar chart data
  const barData = monthlySummary.map((m) => ({
    month: MONTHS[m.month - 1],
    Income: m.income,
    Expense: m.expense,
  }));

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#f1f0ff]">{greeting()}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-sm text-[#6b6880] mt-0.5">Here's your overview for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Monthly Income" value={formatCurrency(summary.totalIncome)} icon={TrendingUp} color="emerald" />
        <StatCard label="Monthly Expense" value={formatCurrency(summary.totalExpense)} icon={TrendingDown} color="rose" />
        <StatCard label="Net Balance" value={formatCurrency(summary.balance)} icon={DollarSign} color={summary.balance >= 0 ? 'violet' : 'rose'} />
        <StatCard label="Total Classes" value={classes.length} icon={BookOpen} color="amber" sub={`${todayClasses.length} today`} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Bar chart – 3 cols */}
        <div className="lg:col-span-3 card p-5">
          <h2 className="text-sm font-semibold text-[#f1f0ff] mb-4">Income vs Expenses — {new Date().getFullYear()}</h2>
          {finLoading ? (
            <div className="h-48 skeleton" />
          ) : barData.some((d) => d.Income > 0 || d.Expense > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} barSize={8} barGap={4}>
                <XAxis dataKey="month" tick={{ fill: '#6b6880', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b6880', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#a09db5' }} />
                <Bar dataKey="Income" fill="#34d399" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="#fb7185" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-[#6b6880] text-sm">No data yet</div>
          )}
        </div>

        {/* Pie chart – 2 cols */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="text-sm font-semibold text-[#f1f0ff] mb-4">Expense Breakdown</h2>
          {finLoading ? (
            <div className="h-48 skeleton" />
          ) : pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(v) => <span style={{ color: '#a09db5', fontSize: 11 }}>{v}</span>}
                  iconType="circle"
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-[#6b6880] text-sm">No expenses yet</div>
          )}
        </div>
      </div>

      {/* Today's classes + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today's Classes */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#f1f0ff] flex items-center gap-2">
              <CalendarDays size={16} className="text-violet-400" /> Today's Classes
            </h2>
            <Link to="/schedule" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {schedLoading ? (
            <div className="space-y-2">{[1, 2].map((i) => <div key={i} className="h-14 skeleton" />)}</div>
          ) : todayClasses.length === 0 ? (
            <p className="text-sm text-[#6b6880] py-6 text-center">No classes scheduled for today</p>
          ) : (
            <div className="space-y-2">
              {todayClasses.map((cls) => (
                <div key={cls._id} className="flex items-center gap-3 p-3 bg-[#1a1a24] rounded-xl border border-[#2a2a38]">
                  <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: cls.color || '#7c3aed' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#f1f0ff] truncate">{cls.subject}</p>
                    <p className="text-xs text-[#6b6880] truncate">{cls.instructor}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#a09db5] flex-shrink-0">
                    <Clock size={12} />
                    {cls.startTime}–{cls.endTime}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#f1f0ff] flex items-center gap-2">
              <Wallet size={16} className="text-violet-400" /> Recent Transactions
            </h2>
            <Link to="/finance" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {finLoading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-12 skeleton" />)}</div>
          ) : recentTransactions.length === 0 ? (
            <p className="text-sm text-[#6b6880] py-6 text-center">No transactions this month</p>
          ) : (
            <div className="space-y-2">
              {recentTransactions.map((tx) => (
                <div key={tx._id} className="flex items-center gap-3 p-3 bg-[#1a1a24] rounded-xl border border-[#2a2a38]">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${tx.type === 'income' ? 'bg-emerald-400/10' : 'bg-rose-400/10'}`}>
                    {tx.type === 'income' ? <TrendingUp size={14} className="text-emerald-400" /> : <TrendingDown size={14} className="text-rose-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#f1f0ff] truncate">{tx.description || tx.category}</p>
                    <p className="text-xs text-[#6b6880]">{tx.category} · {new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                  <p className={`text-sm font-semibold flex-shrink-0 ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
